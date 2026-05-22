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

idx_path = os.path.join(repo, '.git', 'objects', 'pack', 'pack-cd23402ffe9ee56b56cbdd72b467fb5489b0f1cc.idx')
pack_path = os.path.join(repo, '.git', 'objects', 'pack', 'pack-cd23402ffe9ee56b56cbdd72b467fb5489b0f1cc.pack')
if not os.path.exists(idx_path) or not os.path.exists(pack_path):
    raise FileNotFoundError('Packfile or index file not found')

with open(idx_path, 'rb') as f:
    idx = f.read()
if idx[:4] != b'\xfftOc':
    raise ValueError('Unsupported index format')
version = struct.unpack('>I', idx[4:8])[0]
if version != 2:
    raise ValueError('Unsupported index version: %s' % version)
fanout = struct.unpack('>256I', idx[8:1032])
num_objects = fanout[-1]
name_start = 1032
name_end = name_start + num_objects * 20
names = [idx[name_start + i * 20:name_start + (i + 1) * 20] for i in range(num_objects)]
crc_start = name_end
offset_start = crc_start + num_objects * 4
large_start = offset_start + num_objects * 4

offsets = [struct.unpack('>I', idx[offset_start + i * 4:offset_start + i * 4 + 4])[0] for i in range(num_objects)]
large_offset_count = sum(1 for off in offsets if off & 0x80000000)
large_offsets = [struct.unpack('>Q', idx[large_start + i * 8:large_start + (i + 1) * 8])[0] for i in range(large_offset_count)]

real_offsets = []
large_index = 0
for off in offsets:
    if off & 0x80000000:
        real_offsets.append(large_offsets[large_index])
        large_index += 1
    else:
        real_offsets.append(off)

sha_to_offset = {names[i].hex(): real_offsets[i] for i in range(num_objects)}
if sha not in sha_to_offset:
    raise KeyError('SHA not found in index: %s' % sha)

with open(pack_path, 'rb') as f:
    pack_header = f.read(12)
    if pack_header[:4] != b'PACK':
        raise ValueError('Invalid pack file')


def read_varint(data, pos=0):
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


def read_pack_header_at(f, offset):
    f.seek(offset)
    c = f.read(1)
    if not c:
        raise EOFError('Unexpected EOF reading object header')
    c = c[0]
    obj_type = (c >> 4) & 7
    size = c & 0x0f
    shift = 4
    while c & 0x80:
        c = f.read(1)[0]
        size |= (c & 0x7f) << shift
        shift += 7
    return obj_type, size, f.tell()


def decompress_object(f):
    decompressor = zlib.decompressobj()
    data = b''
    while True:
        chunk = f.read(4096)
        if not chunk:
            break
        data += decompressor.decompress(chunk)
        if decompressor.unused_data:
            unused = decompressor.unused_data
            f.seek(-len(unused), os.SEEK_CUR)
            break
    data += decompressor.flush()
    return data


def apply_delta(base, delta):
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


def read_object_by_offset(f, offset):
    obj_type, size, after_header = read_pack_header_at(f, offset)
    f.seek(after_header)
    if obj_type == 6:
        base_off = 0
        c = f.read(1)[0]
        base_off = c & 0x7f
        while c & 0x80:
            c = f.read(1)[0]
            base_off = ((base_off + 1) << 7) | (c & 0x7f)
        base_pos = offset - base_off
        compressed_data = f.read()
        delta = zlib.decompress(compressed_data)
        base_type, base_data = read_object_by_offset(f, base_pos)
        return base_type, apply_delta(base_data, delta)
    elif obj_type == 7:
        base_sha = f.read(20).hex()
        compressed_data = f.read()
        delta = zlib.decompress(compressed_data)
        base_offset = sha_to_offset[base_sha]
        base_type, base_data = read_object_by_offset(f, base_offset)
        return base_type, apply_delta(base_data, delta)
    else:
        decompressed = decompress_object(f)
        types = {1: 'commit', 2: 'tree', 3: 'blob', 4: 'tag'}
        return types.get(obj_type, 'unknown'), decompressed

object_offset = sha_to_offset[sha]
obj_type, obj_data = read_object_by_offset(open(pack_path, 'rb'), object_offset)
if obj_type != 'commit':
    raise ValueError('HEAD object is not a commit')

lines = obj_data.decode('utf-8', errors='replace').splitlines()
tree_sha = None
for line in lines:
    if line.startswith('tree '):
        tree_sha = line.split()[1]
        break
if tree_sha is None:
    raise ValueError('Tree SHA not found in commit')

# traverse tree
path_parts = ['app', 'templates', 'index.html']
current_sha = tree_sha
with open(pack_path, 'rb') as f:
    for part in path_parts:
        typ, data = read_object_by_offset(f, sha_to_offset[current_sha])
        if typ != 'tree':
            raise ValueError('Expected tree object while traversing path')
        found = False
        i = 0
        while i < len(data):
            j = data.index(b' ', i)
            mode = data[i:j].decode()
            k = data.index(b'\x00', j)
            name = data[j+1:k].decode()
            obj_sha = data[k+1:k+21].hex()
            i = k + 21
            if name == part:
                current_sha = obj_sha
                found = True
                break
        if not found:
            raise FileNotFoundError('Path not found in tree: %s' % part)

obj_type, obj_data = read_object_by_offset(f, sha_to_offset[current_sha])
if obj_type != 'blob':
    raise ValueError('Expected blob object for index.html')

curpath = os.path.join(repo, 'app', 'templates', 'index.html')
backup_path = curpath + '.undo-backup'
shutil.copyfile(curpath, backup_path)
with open(curpath, 'wb') as f:
    f.write(obj_data)
print('restored', curpath)
print('backup saved to', backup_path)
