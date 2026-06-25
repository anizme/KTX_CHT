import enum

class Null(str, enum.Enum):
    UPPER_NULL = "NULL"
    LOWER_NULL = "null"