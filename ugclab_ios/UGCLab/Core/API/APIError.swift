import Foundation

enum APIError: LocalizedError {
    case server(Int, String)
    case decoding
    case network(String)
    case unauthorized

    var errorDescription: String? {
        switch self {
        case .server(_, let message): return message
        case .decoding: return "خطأ في قراءة البيانات"
        case .network(let msg): return msg
        case .unauthorized: return "غير مصرح به، يرجى تسجيل الدخول"
        }
    }
}
