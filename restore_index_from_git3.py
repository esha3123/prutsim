import os
import zlib
import struct
import shutil

repo = r'E:\mba'
headfile = os.path.join(repo, '.git', 'HEAD')
with open(headfile, 'r', encoding='utf-8') as f:
    head = f.read().strip()
if head.startswith('ref: '):
    ref = head[5:]
    reffile = os.path.join(repo, '.git', *ref.split('/'))
    with open(reffile, 'r', encoding='utf-8') as f:
        sha = f.read().strip()
else:
    sha = head

pack_dir = os.path.join(repo, '.git', 'objects', 'pack')
idx_files = [f for f in os.listdir(pack_dir) if f.endswith('.idx')]
if not idx_files:
    raise FileNotFoundError('No git pack index found')
idx_path = os.path.join(pack_dir, idx_files[0])
pack_path = os.path.join(pack_dir, idx_files[0][:-4] + '.pack')
if not os.path.exists(pack_path):
    raise FileNotFoundError('Pack file not found for index')


def read_loose_object(sha):
    object_path = os.path.join(repo, '.git', 'objects', sha[:2], sha[2:])
    if not os.path.exists(object_path):
        return None
    with open(object_path, 'rb') as f:
        data = zlib.decompress(f.read())
    nul = data.index(b'\x00')
    obj_type = data[:nul].split(b' ')[0].decode()
    return obj_type, data[nul+1:]


def parse_idx():
    with open(idx_path, 'rb') as f:
        idx = f.read()
    if idx[:4] != b'\xfftOc':
        raise ValueError('Unsupported idx version')
    version = struct.unpack('>I', idx[4:8])[0]
    if version != 2:
        raise ValueError('Unsupported idx version %s' % version)
    fanout = struct.unpack('>256I', idx[8:1032])
    num_objects = fanout[-1]
    name_start = 1032
    name_end = name_start + num_objects * 20
    names = [idx[name_start + i * 20:name_start + (i + 1) * 20] for i in range(num_objects)]
    crc_start = name_end
    offset_start = crc_start + num_objects * 4
    large_start = offset_start + num_objects * 4
    offsets = [struct.unpack('>I', idx[offset_start + i * 4:offset_start + (i + 1) * 4])[0] for i in range(num_objects)]
    large_offsets = []
    high_count = sum(1 for o in offsets if o & 0x80000000)
    for i in range(high_count):
        v = struct.unpack('>Q', idx[large_start + i * 8:large_start + (i + 1) * 8])[0]
        large_offsets.append(v)
    real_offsets = []
    large_index = 0
    for off in offsets:
        if off & 0x80000000:
            real_offsets.append(large_offsets[large_index])
            large_index += 1
        else:
            real_offsets.append(off)
    return {names[i].hex(): real_offsets[i] for i in range(num_objects)}


sha_to_offset = parse_idx()


def read_pack_header_at(f, offset):
    f.seek(offset)
    first = f.read(1)
    if not first:
        raise EOFError('Unexpected EOF while reading pack header')
    c = first[0]
    obj_type = (c >> 4) & 7
    size = c & 0x0f
    shift = 4
    while c & 0x80:
        byte = f.read(1)[0]
        size |= (byte & 0x7f) << shift
        shift += 7
        c = byte
    return obj_type, size, f.tell()


def decompress_stream(f):
    decompress = zlib.decompressobj()
    data = b''
    while True:
        chunk = f.read(8192)
        if not chunk:
            data += decompress.flush()
            break
        data += decompress.decompress(chunk)
        if decompress.unused_data:
            unused = decompress.unused_data
            data += decompress.flush()
            f.seek(-len(unused), os.SEEK_CUR)
            break
    return data


def apply_delta(base, delta):
    def read_varint(data, pos):
        value = 0
        shift = 0
        while True:
            byte = data[pos]
            pos += 1
            value |= (byte & 0x7f) << shift
            if not (byte & 0x80):
                break
            shift += 7
        return value, pos

    src_size, pos = read_varint(delta, 0)
    tgt_size, pos = read_varint(delta, pos)
    result = bytearray()
    while pos < len(delta):
        cmd = delta[pos]
        pos += 1
        if cmd & 0x80:
            cp_off = 0
            cp_size = 0
            if cmd & 1:
                cp_off = delta[pos]
                pos += 1
            if cmd & 2:
                cp_off |= delta[pos] << 8
                pos += 1
            if cmd & 4:
                cp_off |= delta[pos] << 16
                pos += 1
            if cmd & 8:
                cp_off |= delta[pos] << 24
                pos += 1
            if cmd & 16:
                cp_size = delta[pos]
                pos += 1
            if cmd & 32:
                cp_size |= delta[pos] << 8
                pos += 1
            if cmd & 64:
                cp_size |= delta[pos] << 16
                pos += 1
            if cp_size == 0:
                cp_size = 0x10000
            result.extend(base[cp_off:cp_off + cp_size])
        elif cmd:
            result.extend(delta[pos:pos + cmd])
            pos += cmd
        else:
            raise ValueError('Invalid delta opcode')
    return bytes(result)


def read_pack_object_by_offset(f, offset):
    obj_type, _, start = read_pack_header_at(f, offset)
    f.seek(start)
    if obj_type == 6:
        base_offset = 0
        byte = f.read(1)[0]
        base_offset = byte & 0x7f
        while byte & 0x80:
            byte = f.read(1)[0]
            base_offset = ((base_offset + 1) << 7) | (byte & 0x7f)
        base_pos = offset - base_offset
        delta = decompress_stream(f)
        base_type, base_data = read_pack_object_by_offset(f, base_pos)
        return base_type, apply_delta(base_data, delta)
    elif obj_type == 7:
        base_sha = f.read(20).hex()
        delta = decompress_stream(f)
        if base_sha not in sha_to_offset:
            raise KeyError('Base SHA not in pack index: %s' % base_sha)
        base_type, base_data = read_pack_object_by_offset(f, sha_to_offset[base_sha])
        return base_type, apply_delta(base_data, delta)
    else:
        data = decompress_stream(f)
        types = {1: 'commit', 2: 'tree', 3: 'blob', 4: 'tag'}
        return types.get(obj_type, 'unknown'), data


def read_object(sha):
    loose = read_loose_object(sha)
    if loose is not None:
        return loose
    if sha not in sha_to_offset:
        raise KeyError('SHA not found in any object store: %s' % sha)
    with open(pack_path, 'rb') as f:
        return read_pack_object_by_offset(f, sha_to_offset[sha])

commit_type, commit_data = read_object(sha)
if commit_type != 'commit':
    raise ValueError('HEAD object is not a commit: %s' % commit_type)

lines = commit_data.decode('utf-8', errors='replace').splitlines()
tree_sha = None
for line in lines:
    if line.startswith('tree '):
        tree_sha = line.split()[1]
        break
if tree_sha is None:
    raise ValueError('Tree SHA not found in commit')

path_parts = ['app', 'templates', 'index.html']
current_sha = tree_sha
for part in path_parts:
    obj_type, tree_data = read_object(current_sha)
    if obj_type != 'tree':
        raise ValueError('Expected tree object while traversing path, got %s' % obj_type)
    i = 0
    found = False
    while i < len(tree_data):
        j = tree_data.index(b' ', i)
        mode = tree_data[i:j].decode()
        k = tree_data.index(b'\x00', j)
        name = tree_data[j+1:k].decode()
        obj_sha = tree_data[k+1:k+21].hex()
        i = k + 21
        if name == part:
            current_sha = obj_sha
            found = True
            break
    if not found:
        raise FileNotFoundError('Path part not found: %s' % part)

obj_type, obj_data = read_object(current_sha)
if obj_type != 'blob':
    raise ValueError('Expected blob object for index.html, got %s' % obj_type)

curpath = os.path.join(repo, 'app', 'templates', 'index.html')
backup_path = curpath + '.undo-backup'
shutil.copyfile(curpath, backup_path)
with open(curpath, 'wb') as f:
    f.write(obj_data)
print('restored', curpath)
print('backup saved to', backup_path)
