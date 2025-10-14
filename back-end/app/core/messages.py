# app/core/messages.py
"""
Module chứa tất cả các thông báo lỗi và thành công trong ứng dụng.
Tập trung hóa messages giúp:
- Dễ dàng thay đổi wording
- Hỗ trợ đa ngôn ngữ trong tương lai
- Tránh duplicate strings
- Tuân thủ DRY principle
"""


# ====================================================================
# AUTHENTICATION & USER MESSAGES
# ====================================================================
class AuthMessages:
    """Thông báo liên quan đến xác thực và người dùng."""

    # Login/Logout
    LOGIN_SUCCESS = "Đăng nhập thành công"
    LOGOUT_SUCCESS = "Đăng xuất thành công"
    INVALID_CREDENTIALS = "Sai email hoặc mật khẩu."
    EMAIL_NOT_VERIFIED = (
        "Email chưa được xác thực. Vui lòng kiểm tra hộp thư đến của bạn."
    )
    USER_INACTIVE = "Người dùng không hoạt động."
    NOT_AUTHENTICATED = "Chưa đăng nhập"
    INVALID_TOKEN_FORMAT = "Sai định dạng token"
    INVALID_TOKEN = "Token không hợp lệ hoặc đã hết hạn"

    # OAuth
    OAUTH_TOKEN_ERROR = "Không thể lấy token từ Google: {error}"
    OAUTH_USER_INFO_ERROR = "Không thể lấy thông tin người dùng từ Google"

    # Email Verification
    EMAIL_VERIFIED_SUCCESS = "Xác thực email thành công!"

    # Password
    PASSWORD_UPDATED = "Mật khẩu đã được cập nhật thành công."
    PASSWORD_RESET_SUCCESS = "Mật khẩu đã được đặt lại thành công."
    INCORRECT_CURRENT_PASSWORD = "Mật khẩu hiện tại không chính xác."
    PASSWORD_RESET_EMAIL_SENT = (
        "Nếu email của bạn tồn tại trong hệ thống, "
        "bạn sẽ nhận được một email hướng dẫn đặt lại mật khẩu."
    )


class AuthValidationMessages:
    """Thông báo validation cho authentication."""

    PASSWORD_MIN_LENGTH = "Mật khẩu phải có ít nhất 8 ký tự"
    PASSWORD_REQUIRE_LETTER_AND_NUMBER = "Mật khẩu phải chứa cả chữ và số"


# ====================================================================
# USER MANAGEMENT MESSAGES
# ====================================================================
class UserMessages:
    """Thông báo liên quan đến quản lý người dùng."""

    # Success
    USER_CREATED = "Người dùng đã được tạo thành công."
    USER_UPDATED = "Thông tin người dùng đã được cập nhật."
    USER_DELETED = "Người dùng đã được xóa."

    # Errors
    EMAIL_ALREADY_EXISTS = "Email đã được sử dụng."
    EMAIL_EXISTS = "Email đã tồn tại."
    USER_NOT_FOUND = "Người dùng với ID {user_id} không được tìm thấy."
    USER_NOT_FOUND_SIMPLE = "Không tìm thấy người dùng"
    USER_NOT_FOUND_OR_INACTIVE = "Người dùng không tồn tại hoặc không hoạt động."

    # Staff Account
    STAFF_ACCOUNT_CREATED = "Tài khoản nhân viên đã được tạo thành công."
    STAFF_ACCOUNT_CREATE_ERROR = (
        "Không thể tạo tài khoản nhân viên do lỗi hệ thống: {error}"
    )


# ====================================================================
# ROLE & PERMISSION MESSAGES
# ====================================================================
class RoleMessages:
    """Thông báo liên quan đến vai trò và quyền."""

    # Success
    ROLE_CREATED = "Vai trò đã được tạo thành công."
    ROLE_UPDATED = "Vai trò đã được cập nhật."
    ROLE_DELETED = "Vai trò đã được xóa."
    ROLE_ASSIGNED = "Vai trò đã được gán cho người dùng."
    ROLE_REMOVED = "Vai trò đã được gỡ khỏi người dùng."

    PERMISSION_CREATED = "Quyền đã được tạo thành công."

    # Errors
    ROLE_NOT_FOUND = "Vai trò không tồn tại"
    ROLE_ALREADY_EXISTS = "Vai trò đã tồn tại."
    ROLE_NAME_ALREADY_EXISTS = "Tên vai trò đã tồn tại."
    ROLE_IN_USE = "Không thể xóa vai trò đang được sử dụng"
    USER_ALREADY_HAS_ROLE = "Người dùng đã có vai trò này"
    USER_DOES_NOT_HAVE_ROLE = "Người dùng không có vai trò này"

    PERMISSION_NOT_FOUND = "Quyền không tồn tại"
    PERMISSION_ALREADY_EXISTS = "Quyền đã tồn tại"
    PERMISSION_ALREADY_ASSIGNED = "Quyền đã được gán cho vai trò này"
    PERMISSION_NOT_IN_ROLE = "Quyền này không thuộc vai trò"
    INSUFFICIENT_PERMISSIONS = "Không đủ quyền truy cập."


# ====================================================================
# CUSTOMER MESSAGES
# ====================================================================
class CustomerMessages:
    """Thông báo liên quan đến khách hàng."""

    # Success
    PROFILE_CREATED = "Hồ sơ khách hàng đã được tạo."
    PROFILE_UPDATED = "Hồ sơ khách hàng đã được cập nhật."
    CUSTOMER_DELETED = "Khách hàng đã được xóa."

    # Errors
    PHONE_NUMBER_EXISTS = "Số điện thoại đã tồn tại."
    PHONE_NUMBER_LINKED_TO_ANOTHER_ACCOUNT = (
        "Số điện thoại đã được liên kết với một tài khoản khác."
    )
    PHONE_NUMBER_REQUIRED = "Số điện thoại là bắt buộc khi tạo hồ sơ."
    CUSTOMER_NOT_FOUND = "Không tìm thấy Customer với ID {customer_id}."


# ====================================================================
# CATEGORY MESSAGES
# ====================================================================
class CategoryMessages:
    """Thông báo liên quan đến danh mục."""

    # Success
    CATEGORY_CREATED = "Danh mục đã được tạo."
    CATEGORY_UPDATED = "Danh mục đã được cập nhật."
    CATEGORY_DELETED = "Danh mục đã được xóa."

    # Errors
    CATEGORY_NOT_FOUND = "Category với ID {category_id} không được tìm thấy."
    CATEGORY_NAME_EXISTS = "Danh mục '{name}' cho loại '{category_type}' đã tồn tại."
    CATEGORY_INVALID_FOR_SERVICE = "Danh mục ID {category_id} không hợp lệ cho dịch vụ."
    CATEGORY_INVALID_FOR_PRODUCT = "Danh mục không hợp lệ cho sản phẩm."
    CATEGORY_IN_USE = "Không thể xóa danh mục đang được sử dụng."


# ====================================================================
# SERVICE MESSAGES
# ====================================================================
class ServiceMessages:
    """Thông báo liên quan đến dịch vụ."""

    # Success
    SERVICE_CREATED = "Dịch vụ đã được tạo."
    SERVICE_UPDATED = "Dịch vụ đã được cập nhật."
    SERVICE_DELETED = "Dịch vụ đã được xóa."

    # Errors
    SERVICE_NOT_FOUND = "Không tìm thấy Service với ID {service_id}."
    SERVICE_NAME_EXISTS = "Dịch vụ '{name}' đã tồn tại."
    SERVICE_MUST_HAVE_CATEGORY = "Dịch vụ phải thuộc về ít nhất một danh mục."
    SERVICE_SAVE_ERROR = "Lỗi khi lưu dịch vụ: {error}"


# ====================================================================
# PRODUCT MESSAGES
# ====================================================================
class ProductMessages:
    """Thông báo liên quan đến sản phẩm."""

    # Success
    PRODUCT_CREATED = "Sản phẩm đã được tạo."
    PRODUCT_UPDATED = "Sản phẩm đã được cập nhật."
    PRODUCT_DELETED = "Sản phẩm đã được xóa."

    # Errors
    PRODUCT_NOT_FOUND = "Không tìm thấy Product với ID {product_id}."
    PRODUCT_NAME_EXISTS = "Sản phẩm '{name}' đã tồn tại."
    PRODUCT_MUST_HAVE_CATEGORY = "Sản phẩm phải thuộc ít nhất một danh mục."
    PRODUCT_SAVE_ERROR = "Lỗi khi lưu sản phẩm: {error}"


# ====================================================================
# IMAGE MESSAGES
# ====================================================================
class ImageMessages:
    """Thông báo liên quan đến hình ảnh."""

    # Success
    IMAGE_UPLOADED = "Hình ảnh đã được tải lên."
    IMAGE_DELETED = "Hình ảnh đã được xóa."

    # Errors
    IMAGE_NOT_FOUND = "Không tìm thấy hình ảnh với ID {image_id}"
    IMAGE_UPLOAD_FAILED = "Tải ảnh lên Supabase thất bại: {error}"
    IMAGE_DELETE_FAILED = "Xóa ảnh từ Supabase thất bại: {error}"
    IMAGE_PERMISSION_DENIED = "Không có quyền sử dụng hình ảnh này làm ảnh đại diện."
    PRIMARY_IMAGE_NOT_IN_LIST = (
        "Ảnh chính được chọn không thuộc danh sách hình ảnh của thực thể."
    )
    INVALID_FILE = "File không hợp lệ."
    UPLOAD_TO_STORAGE_FAILED = "Không thể tải ảnh lên kho lưu trữ."


# ====================================================================
# STAFF MESSAGES
# ====================================================================
class StaffMessages:
    """Thông báo liên quan đến quản lý nhân viên."""

    # Success
    STAFF_PROFILE_CREATED = "Hồ sơ nhân viên đã được tạo."
    STAFF_PROFILE_UPDATED = "Hồ sơ nhân viên đã được cập nhật."
    STAFF_PROFILE_DELETED = "Hồ sơ nhân viên đã được xóa."

    # Errors
    STAFF_PROFILE_NOT_FOUND = "Không tìm thấy hồ sơ nhân viên"
    STAFF_USER_NOT_FOUND = "Tài khoản người dùng không tồn tại"
    STAFF_ALREADY_EXISTS = "Người dùng này đã có hồ sơ nhân viên."
    STAFF_SCHEDULE_NOT_FOUND = "Không tìm thấy lịch làm việc"
    STAFF_SERVICE_NOT_FOUND = "Một hoặc nhiều dịch vụ không tồn tại"
    STAFF_SCHEDULE_RECURRING_REQUIRE_DAY = "Ca lặp lại hàng tuần phải có day_of_week"
    STAFF_TIME_OFF_REQUEST_NOT_FOUND = "Không tìm thấy yêu cầu nghỉ phép"


# ====================================================================
# SCHEDULE & APPOINTMENT MESSAGES
# ====================================================================
class ScheduleMessages:
    """Thông báo liên quan đến lịch hẹn và ca làm việc."""

    # Success
    SCHEDULE_CREATED = "Lịch hẹn đã được tạo."
    SCHEDULE_UPDATED = "Lịch hẹn đã được cập nhật."
    SCHEDULE_DELETED = "Lịch hẹn đã được xóa."

    # Errors
    SCHEDULE_NOT_FOUND = "Không tìm thấy lịch hẹn."


# ====================================================================
# TREATMENT PLAN MESSAGES
# ====================================================================
class TreatmentPlanMessages:
    """Thông báo liên quan đến liệu trình điều trị."""

    # Success
    TREATMENT_PLAN_CREATED = "Liệu trình đã được tạo."
    TREATMENT_PLAN_UPDATED = "Liệu trình đã được cập nhật."
    TREATMENT_PLAN_DELETED = "Liệu trình đã được xóa."

    # Errors
    TREATMENT_PLAN_NOT_FOUND = "Không tìm thấy liệu trình với ID {plan_id}."
    TREATMENT_PLAN_NAME_EXISTS = "Liệu trình '{name}' đã tồn tại."
    TREATMENT_PLAN_SAVE_ERROR = "Lỗi khi lưu liệu trình: {error}"
    TREATMENT_PLAN_CATEGORY_INVALID = "Danh mục không hợp lệ cho liệu trình."


# ====================================================================
# GENERIC MESSAGES
# ====================================================================
class GenericMessages:
    """Thông báo chung."""

    # Success
    OPERATION_SUCCESS = "Thao tác thành công."
    CREATED_SUCCESS = "Tạo mới thành công."
    UPDATED_SUCCESS = "Cập nhật thành công."
    DELETED_SUCCESS = "Xóa thành công."

    # Errors
    INTERNAL_SERVER_ERROR = "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."
    VALIDATION_ERROR = "Dữ liệu không hợp lệ."
    NOT_FOUND = "Không tìm thấy tài nguyên."
    UNAUTHORIZED = "Bạn không có quyền thực hiện hành động này."

    # API Status
    API_HEALTHY = "Welcome to my FastAPI application!"
