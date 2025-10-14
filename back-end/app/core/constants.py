# app/core/constants.py
"""
Module chứa các hằng số được sử dụng trong toàn bộ ứng dụng.
Tuân thủ nguyên tắc: Tránh Magic Numbers, tăng khả năng bảo trì.
"""
from datetime import timedelta


# ====================================================================
# TOKEN & AUTHENTICATION CONSTANTS
# ====================================================================
class TokenExpiry:
    """Các hằng số liên quan đến thời gian hết hạn của token."""

    # Thời gian hết hạn access token (phút)
    ACCESS_TOKEN_EXPIRE_MINUTES = 30

    # Thời gian hết hạn email verification token (giây)
    EMAIL_VERIFICATION_TOKEN_MAX_AGE = 3600  # 1 giờ

    # Thời gian hết hạn password reset token (giây)
    PASSWORD_RESET_TOKEN_MAX_AGE = 900  # 15 phút

    # Thời gian hết hạn set password token cho staff mới (ngày)
    SET_PASSWORD_TOKEN_MAX_AGE_DAYS = 7  # 7 ngày

    @classmethod
    def get_set_password_max_age(cls) -> int:
        """Trả về thời gian hết hạn set password token tính bằng giây."""
        return cls.SET_PASSWORD_TOKEN_MAX_AGE_DAYS * 24 * 60 * 60


# ====================================================================
# PASSWORD VALIDATION CONSTANTS
# ====================================================================
class PasswordPolicy:
    """Các hằng số liên quan đến chính sách mật khẩu."""

    MIN_LENGTH = 8
    MAX_LENGTH = 40
    REQUIRE_LETTER = True
    REQUIRE_NUMBER = True

    # Temporary password prefix for new staff accounts
    TEMP_PASSWORD_PREFIX = "temp_password_"


# ====================================================================
# PAGINATION CONSTANTS
# ====================================================================
class Pagination:
    """Các hằng số liên quan đến phân trang."""

    DEFAULT_SKIP = 0
    DEFAULT_LIMIT = 100
    MAX_LIMIT = 1000


# ====================================================================
# FIELD LENGTH CONSTANTS
# ====================================================================
class FieldLength:
    """Các hằng số về độ dài tối đa của các trường dữ liệu."""

    FULL_NAME_MAX = 100
    PHONE_NUMBER_MAX = 20
    GENDER_MAX = 10
    OTP_LENGTH = 6
    POSITION_MAX = 100


# ====================================================================
# BUSINESS LOGIC CONSTANTS
# ====================================================================
class DefaultRoles:
    """Các tên vai trò mặc định trong hệ thống."""

    ADMIN = "admin"
    STAFF = "staff"
    CUSTOMER = "customer"


class EmailSalts:
    """Salt values cho các loại email token khác nhau."""

    EMAIL_CONFIRMATION = "email-confirm-salt"
    PASSWORD_RESET = "password-reset-salt"


# ====================================================================
# HTTP STATUS CONSTANTS (Để tham chiếu dễ hơn)
# ====================================================================
class HTTPStatus:
    """HTTP Status codes thường dùng (FastAPI đã có sẵn, nhưng để tiện tham chiếu)."""

    OK = 200
    CREATED = 201
    NO_CONTENT = 204
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    CONFLICT = 409
    UNPROCESSABLE_ENTITY = 422
    INTERNAL_SERVER_ERROR = 500
