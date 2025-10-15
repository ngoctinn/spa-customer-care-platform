# app/core/exceptions.py

"""
Định nghĩa các lớp ngoại lệ tùy chỉnh cho ứng dụng.

Mô-đun này chứa các exception cơ sở và các exception cụ thể
được sử dụng trong toàn bộ ứng dụng để xử lý lỗi nghiệp vụ.
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(Exception):
    """
    Lớp ngoại lệ cơ sở cho tất cả các ngoại lệ tùy chỉnh của ứng dụng.

    Attributes:
        message (str): Thông báo lỗi bằng tiếng Việt.
        status_code (int): Mã trạng thái HTTP tương ứng.
        details (Optional[Dict[str, Any]]): Thông tin chi tiết bổ sung.
    """

    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class AuthenticationError(AppException):
    """Ngoại lệ liên quan đến xác thực người dùng."""

    def __init__(
        self, message: str = "Lỗi xác thực", details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED, details)


class AuthorizationError(AppException):
    """Ngoại lệ liên quan đến phân quyền."""

    def __init__(
        self,
        message: str = "Không có quyền truy cập",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, status.HTTP_403_FORBIDDEN, details)


class ValidationError(AppException):
    """Ngoại lệ liên quan đến xác thực dữ liệu."""

    def __init__(
        self,
        message: str = "Dữ liệu không hợp lệ",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, details)


class NotFoundError(AppException):
    """Ngoại lệ khi không tìm thấy tài nguyên."""

    def __init__(
        self,
        message: str = "Không tìm thấy tài nguyên",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, status.HTTP_404_NOT_FOUND, details)


class ConflictError(AppException):
    """Ngoại lệ khi có xung đột dữ liệu."""

    def __init__(
        self,
        message: str = "Xung đột dữ liệu",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, status.HTTP_409_CONFLICT, details)


class BusinessLogicError(AppException):
    """Ngoại lệ logic nghiệp vụ chung."""

    def __init__(
        self,
        message: str = "Lỗi logic nghiệp vụ",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, status.HTTP_400_BAD_REQUEST, details)


class InternalServerError(AppException):
    """Ngoại lệ lỗi máy chủ nội bộ."""

    def __init__(
        self,
        message: str = "Lỗi máy chủ nội bộ",
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR, details)


# Các exception cụ thể cho từng module


class AuthExceptions:
    """Các ngoại lệ liên quan đến xác thực."""

    @staticmethod
    def invalid_credentials():
        return AuthenticationError("Thông tin đăng nhập không hợp lệ")

    @staticmethod
    def email_not_verified():
        return BusinessLogicError("Email chưa được xác thực")

    @staticmethod
    def user_inactive():
        return BusinessLogicError("Tài khoản đã bị vô hiệu hóa")

    @staticmethod
    def invalid_token():
        return ValidationError("Token không hợp lệ hoặc đã hết hạn")

    @staticmethod
    def incorrect_current_password():
        return ValidationError("Mật khẩu hiện tại không đúng")

    @staticmethod
    def oauth_error(error: str):
        return AuthenticationError(f"Lỗi OAuth: {error}")

    @staticmethod
    def oauth_user_info_error():
        return ValidationError("Không thể lấy thông tin người dùng từ OAuth provider")


class UserExceptions:
    """Các ngoại lệ liên quan đến người dùng."""

    @staticmethod
    def user_not_found():
        return NotFoundError("Không tìm thấy người dùng")

    @staticmethod
    def email_already_exists():
        return ConflictError("Email đã được sử dụng")

    @staticmethod
    def staff_profile_not_found():
        return NotFoundError("Không tìm thấy hồ sơ nhân viên")


class StaffExceptions:
    """Các ngoại lệ liên quan đến nhân viên."""

    @staticmethod
    def staff_not_found():
        return NotFoundError("Không tìm thấy nhân viên")

    @staticmethod
    def invalid_position():
        return ValidationError("Chức vụ không hợp lệ")

    @staticmethod
    def user_not_found():
        return NotFoundError("Không tìm thấy người dùng")

    @staticmethod
    def staff_profile_not_found():
        return NotFoundError("Không tìm thấy hồ sơ nhân viên")

    @staticmethod
    def service_not_found():
        return NotFoundError("Không tìm thấy dịch vụ")

    @staticmethod
    def invalid_schedule_data():
        return ValidationError("Dữ liệu lịch trình không hợp lệ")

    @staticmethod
    def schedule_not_found():
        return NotFoundError("Không tìm thấy lịch trình")

    @staticmethod
    def invalid_request_data():
        return ValidationError("Dữ liệu yêu cầu không hợp lệ")

    @staticmethod
    def time_off_request_not_found():
        return NotFoundError("Không tìm thấy yêu cầu nghỉ phép")

    @staticmethod
    def admin_required():
        return AuthorizationError(
            "Chỉ quản trị viên mới được phép thực hiện thao tác này"
        )


class ServiceExceptions:
    """Các ngoại lệ liên quan đến dịch vụ."""

    @staticmethod
    def service_not_found():
        return NotFoundError("Không tìm thấy dịch vụ")

    @staticmethod
    def service_already_exists():
        return ConflictError("Dịch vụ đã tồn tại")

    @staticmethod
    def service_must_have_category():
        return ValidationError("Dịch vụ phải có ít nhất một danh mục")

    @staticmethod
    def invalid_category_for_service():
        return ValidationError("Danh mục không hợp lệ cho dịch vụ")

    @staticmethod
    def service_name_exists():
        return ConflictError("Tên dịch vụ đã tồn tại")

    @staticmethod
    def service_save_error():
        return InternalServerError("Lỗi khi lưu dịch vụ")


class ProductExceptions:
    """Các ngoại lệ liên quan đến sản phẩm."""

    @staticmethod
    def product_not_found():
        return NotFoundError("Không tìm thấy sản phẩm")

    @staticmethod
    def product_already_exists():
        return ConflictError("Sản phẩm đã tồn tại")

    @staticmethod
    def product_name_exists():
        return ConflictError("Tên sản phẩm đã tồn tại")

    @staticmethod
    def invalid_category_for_product():
        return ValidationError("Danh mục không hợp lệ cho sản phẩm")

    @staticmethod
    def product_must_have_category():
        return ValidationError("Sản phẩm phải có ít nhất một danh mục")

    @staticmethod
    def product_save_error():
        return InternalServerError("Lỗi khi lưu sản phẩm")


class CatalogExceptions:
    """Các ngoại lệ liên quan đến danh mục."""

    @staticmethod
    def category_not_found():
        return NotFoundError("Không tìm thấy danh mục")

    @staticmethod
    def category_name_exists():
        return ConflictError("Tên danh mục đã tồn tại")

    @staticmethod
    def category_in_use():
        return ValidationError("Danh mục đang được sử dụng")


class CustomerExceptions:
    """Các ngoại lệ liên quan đến khách hàng."""

    @staticmethod
    def customer_not_found():
        return NotFoundError("Không tìm thấy khách hàng")

    @staticmethod
    def customer_already_exists():
        return ConflictError("Khách hàng đã tồn tại")


class ScheduleExceptions:
    """Các ngoại lệ liên quan đến lịch hẹn."""

    @staticmethod
    def schedule_not_found():
        return NotFoundError("Không tìm thấy lịch hẹn")

    @staticmethod
    def time_conflict():
        return ConflictError("Thời gian bị trùng lặp")

    @staticmethod
    def user_not_found():
        return NotFoundError("Không tìm thấy người dùng")

    @staticmethod
    def invalid_schedule_count():
        return ValidationError("Cần cung cấp đủ thông tin cho 7 ngày trong tuần")


class TreatmentPlanExceptions:
    """Các ngoại lệ liên quan đến kế hoạch điều trị."""

    @staticmethod
    def treatment_plan_not_found():
        return NotFoundError("Không tìm thấy kế hoạch điều trị")

    @staticmethod
    def invalid_treatment_plan():
        return ValidationError("Kế hoạch điều trị không hợp lệ")

    @staticmethod
    def invalid_category_for_treatment_plan():
        return ValidationError("Danh mục không hợp lệ cho kế hoạch điều trị")

    @staticmethod
    def treatment_plan_name_exists():
        return ConflictError("Tên kế hoạch điều trị đã tồn tại")

    @staticmethod
    def treatment_plan_save_error():
        return InternalServerError("Lỗi khi lưu kế hoạch điều trị")


class CustomerExceptions:
    """Các ngoại lệ liên quan đến khách hàng."""

    @staticmethod
    def customer_not_found():
        return NotFoundError("Không tìm thấy khách hàng")

    @staticmethod
    def customer_already_exists():
        return ConflictError("Khách hàng đã tồn tại")

    @staticmethod
    def phone_number_exists():
        return ConflictError("Số điện thoại đã được sử dụng")

    @staticmethod
    def phone_number_linked_to_another_account():
        return ConflictError("Số điện thoại đã được liên kết với tài khoản khác")

    @staticmethod
    def phone_number_required():
        return ValidationError("Số điện thoại là bắt buộc")


class RoleExceptions:
    """Các ngoại lệ liên quan đến vai trò."""

    @staticmethod
    def user_already_has_role():
        return ConflictError("Người dùng đã có vai trò này")

    @staticmethod
    def user_does_not_have_role():
        return ValidationError("Người dùng không có vai trò này")

    @staticmethod
    def role_not_found():
        return NotFoundError("Không tìm thấy vai trò")

    @staticmethod
    def role_already_exists():
        return ConflictError("Vai trò đã tồn tại")

    @staticmethod
    def role_name_already_exists():
        return ConflictError("Tên vai trò đã tồn tại")

    @staticmethod
    def role_in_use():
        return BusinessLogicError("Vai trò đang được sử dụng")

    @staticmethod
    def permission_already_exists():
        return ConflictError("Quyền đã tồn tại")

    @staticmethod
    def permission_not_found():
        return NotFoundError("Không tìm thấy quyền")

    @staticmethod
    def permission_already_assigned():
        return ConflictError("Quyền đã được gán cho vai trò")

    @staticmethod
    def permission_not_in_role():
        return ValidationError("Quyền không thuộc về vai trò này")


class ImageExceptions:
    """Các ngoại lệ liên quan đến hình ảnh."""

    @staticmethod
    def image_not_found():
        return NotFoundError("Không tìm thấy hình ảnh")

    @staticmethod
    def invalid_file():
        return ValidationError("File không hợp lệ")

    @staticmethod
    def upload_failed():
        return InternalServerError("Tải ảnh lên thất bại")
