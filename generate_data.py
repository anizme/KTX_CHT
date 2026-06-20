import json
import random
from datetime import date

HOMETOWNS = [
    "Thạch Lạc",
    "Đồng Tiến",
    "Thạch Khê",
    "Cẩm Bình",
    "Kỳ Xuân",
    "Kỳ Anh",
    "Kỳ Hoa",
    "Kỳ Văn",
    "Kỳ Khang",
    "Kỳ Lạc",
    "Kỳ Thượng",
    "Cẩm Xuyên",
    "Thiên Cầm",
    "Cẩm Duệ",
    "Cẩm Hưng",
    "Cẩm Lạc",
    "Cẩm Trung",
    "Yên Hòa",
    "Thạch Hà",
    "Toàn Lưu",
    "Việt Xuyên",
    "Đông Kinh",
    "Thạch Xuân",
    "Lộc Hà",
    "Hồng Lộc",
    "Mai Phụ",
    "Can Lộc",
    "Tùng Lộc",
    "Gia Hanh",
    "Trường Lưu",
    "Xuân Lộc",
    "Đồng Lộc",
    "Tiên Điền",
    "Nghi Xuân",
    "Cổ Đạm",
    "Đan Hải",
    "Đức Thọ",
    "Đức Đồng",
    "Đức Quang",
    "Đức Thịnh",
    "Đức Minh",
    "Hương Sơn",
    "Sơn Tây",
    "Tứ Mỹ",
    "Sơn Giang",
    "Sơn Tiến",
    "Sơn Hồng",
    "Kim Hoa",
    "Vũ Quang",
    "Mai Hoa",
    "Thượng Đức",
    "Hương Khê",
    "Hương Phố",
    "Hương Đô",
    "Hà Linh",
    "Hương Bình",
    "Phúc Trạch",
    "Hương Xuân",
    "Thành Sen",
    "Trần Phú",
    "Hà Huy Tập",
    "Vũng Áng",
    "Sông Trí",
    "Hoành Sơn",
    "Hải Ninh",
    "Bắc Hồng Lĩnh",
    "Nam Hồng Lĩnh"
]

LAST_NAMES = [
    "Nguyễn", "Trần", "Lê", "Phạm", "Hoàng",
    "Vũ", "Đặng", "Bùi", "Đỗ", "Ngô"
]

MIDDLE_NAMES = [
    "Văn", "Thị", "Minh", "Đức", "Quang",
    "Ngọc", "Anh", "Gia", "Thanh", "Hữu"
]

FIRST_NAMES = [
    "An", "Anh", "Bình", "Chi", "Dũng",
    "Giang", "Hà", "Hải", "Hằng", "Hiếu",
    "Hùng", "Khánh", "Linh", "Long", "Mai",
    "Nam", "Ngọc", "Phúc", "Quân", "Tâm",
    "Thảo", "Trang", "Trung", "Tú", "Việt"
]


def random_name():
    return f"{random.choice(LAST_NAMES)} {random.choice(MIDDLE_NAMES)} {random.choice(FIRST_NAMES)}"


def random_birthdate():
    year = random.randint(2006, 2009)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    return f"{year:04d}-{month:02d}-{day:02d}"


students = []
buildings = []

student_id = 1

# =========================
# TÒA A1
# =========================
a1 = {
    "id": "A1",
    "name": "Tòa A1",
    "floors": []
}

for floor in range(1, 6):
    floor_obj = {
        "id": f"A1-F{floor}",
        "name": f"Tầng {floor}",
        "rooms": []
    }

    if floor == 1:
        floor_obj["rooms"].append({
            "id": f"A1-F{floor}01",
            "name": f"{floor}01",
            "capacity": 0,
            "studentIds": [],
            "type": "Canteen"
        })
        a1["floors"].append(floor_obj)
        continue

    for room in range(1, 13):
        room_no = f"{floor}{room:02d}"
        room_type = "Phòng ở"

        # Phòng gần kín
        occupied = random.choice([5, 6, 6, 6, 6])

        student_ids = []

        for _ in range(occupied):
            sid = student_id
            student_id += 1

            students.append({
                "id": sid,
                "name": random_name(),
                "sex": random.choice(["Nam", "Nữ"]),
                "birthDate": random_birthdate(),
                "class": f"{random.randint(10,12)}A{random.randint(1,10)}",
                "hometown": random.choice(HOMETOWNS),
                "roomId": room_no
            })

            student_ids.append(sid)

        floor_obj["rooms"].append({
            "id": room_no,
            "name": room_no,
            "type": room_type,
            "capacity": 6,
            "studentIds": student_ids
        })

    a1["floors"].append(floor_obj)

buildings.append(a1)

# =========================
# TÒA A2
# =========================

a2 = {
    "id": "A2",
    "name": "Tòa A2",
    "floors": []
}

floor_prefixes = {
    1: 65,
    2: 66,
    3: 67,
    4: 68,
    5: 69
}

for floor in range(1, 6):
    floor_obj = {
        "id": f"A2-F{floor}",
        "name": f"Tầng {floor}",
        "rooms": []
    }

    prefix = floor_prefixes[floor]

    for room in range(1, 10):
        room_no = f"{prefix}{room}"

        room_type = "Phòng ở"
        capacity = 6

        if room_no in ["651", "661", "671"]:
            capacity = 8

        if room_no in ["681", "691"]:
            room_type = "Phòng tự học"
            capacity = 0

        student_ids = []

        if room_type == "Phòng ở":
            occupied = random.randint(max(1, capacity - 1), capacity)

            for _ in range(occupied):
                sid = student_id
                student_id += 1

                students.append({
                    "id": sid,
                    "name": random_name(),
                    "sex": random.choice(["Nam", "Nữ"]),
                    "birthDate": random_birthdate(),
                    "class": f"{random.randint(10,12)}A{random.randint(1,10)}",
                    "hometown": random.choice(HOMETOWNS),
                    "roomId": room_no
                })

                student_ids.append(sid)

        floor_obj["rooms"].append({
            "id": room_no,
            "name": room_no,
            "type": room_type,
            "capacity": capacity,
            "studentIds": student_ids
        })

    a2["floors"].append(floor_obj)

buildings.append(a2)

data = {
    "buildings": buildings,
    "students": students
}

with open("/home/anizme/Documents/KTX_CHT/data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Generated {len(students)} students")
print("Output: dormitory_data.json")
