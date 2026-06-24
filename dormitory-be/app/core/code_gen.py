"""Auto-generate primary keys following project conventions."""
import uuid

def floor_code(building_code: str, number: int) -> str:
    """NT1 + 3  →  NT1-T3"""
    return f"{building_code}-T{number}"


def room_code(floor_code: str, label: str) -> str:
    """NT1-T3 + 201A  →  NT1-T3-P201A"""
    return f"{floor_code}-P{label.upper()}"