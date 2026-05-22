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

fanout = struct.unpack('>256I', idx[8:8+1024])
num_objects = fanout[-1]
name_start = 8 + 1024
name_end = name_start + num_objects * 20
names = [idx[name_start + i*20:name_start + (i+1)*20] for i in range(num_objects)]
pos = name_end
crc_pos = pos
pos += num_objects * 4
offsets_pos = pos
pos += num_objects * 4
large_offset_pos = pos
large_offsets = []
for i in range(num_objects):
    off = struct.unpack('>I', idx[offsets_pos + i*4:offsets_pos + i*4 + 4])[0]
    if off & 0x80000000:
        large_offset_index = off & 0x7fffffff
        large_offsets.append((i, large_offset_index))
    else:
        large_offsets.append((i, off))

large_base = offsets_pos + num_objects * 4
large_values = []
for ii, val in large_offset_index if idx else []:
    pass

# Build offset list with large offsets if needed
object_offsets = []
for i in range(num_objects):
    off = struct.unpack('>I', idx[offsets_pos + i*4:offsets_pos + i*4 + 4])[0]
    if off & 0x80000000:
        none
    else:
        object_offsets.append(off)

# This will be corrected later with pack parsing if necessary


def read_pack_object(offset):
    with open(pack_path, 'rb') as f:
        f.seek(offset)
        c = ord(f.read(1))
        obj_type = (c >> 4) & 7
        size = c & 0x0f
        shift = 4
        while c & 0x80:
            c = ord(f.read(1))
            size |= (c & 0x7f) << shift
            shift += 7
        if obj_type == 6:
            # ofs-delta
            c = ord(f.read(1))
            base_offset = c & 0x7f
            while c & 0x80:
                c = ord(f.read(1))
                base_offset = ((base_offset + 1) << 7) | (c & 0x7f)
            base_pos = offset - base_offset
            base_type, base_data = read_pack_object(base_pos)
            compressed = f.read()
            data = zlib.decompress(compressed)
            return base_type, apply_delta(base_data, data)
        elif obj_type == 7:
            base_sha = f.read(20).hex()
            compressed = f.read()
            data = zlib.decompress(compressed)
            base_type, base_data = read_pack_object(get_offset_by_sha(base_sha))
            return base_type, apply_delta(base_data, data)
        else:
            compressed = f.read()
            data = zlib.decompress(compressed)
            types = {1: 'commit', 2: 'tree', 3: 'blob', 4: 'tag'}
            return types.get(obj_type, 'unknown'), data


def apply_delta(base, delta):
    def read_varint(data, pos):
        res = 0
        shift = 0
        while True:
            byte = data[pos]
            pos += 1
            res |= (byte & 0x7f) << shift
            if not (byte & 0x80):
                break
            shift += 7
        return res, pos

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

# This script is incomplete; please proceed with a simpler direct pack extraction.
print('Need fallback approach to extract object from packed git.')
