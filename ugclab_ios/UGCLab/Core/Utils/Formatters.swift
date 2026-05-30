import Foundation

struct Formatters {
    static func currency(_ amount: Double) -> String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.locale = Locale(identifier: "ar")
        formatter.maximumFractionDigits = 0
        let num = formatter.string(from: NSNumber(value: amount)) ?? "\(Int(amount))"
        return "\(num) د.ع"
    }

    static func compactCurrency(_ amount: Double) -> String {
        if amount >= 1_000_000 {
            return "\(String(format: "%.1f", amount / 1_000_000))M د.ع"
        } else if amount >= 1_000 {
            return "\(String(format: "%.1f", amount / 1_000))K د.ع"
        }
        return "\(Int(amount)) د.ع"
    }

    static func date(_ dateString: String?) -> String {
        guard let dateString else { return "" }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: dateString) ?? ISO8601DateFormatter().date(from: dateString) else {
            return dateString
        }
        let df = DateFormatter()
        df.dateFormat = "yyyy/MM/dd"
        df.locale = Locale(identifier: "ar")
        return df.string(from: date)
    }

    static func relativeTime(_ dateString: String?) -> String {
        guard let dateString else { return "" }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        guard let date = formatter.date(from: dateString) ?? ISO8601DateFormatter().date(from: dateString) else {
            return dateString
        }
        let interval = Date().timeIntervalSince(date)
        if interval < 60 { return "الآن" }
        if interval < 3600 { return "منذ \(Int(interval / 60)) د" }
        if interval < 86400 { return "منذ \(Int(interval / 3600)) س" }
        if interval < 604800 { return "منذ \(Int(interval / 86400)) ي" }
        return date(dateString)
    }

    static func campaignStatus(_ status: String) -> String {
        switch status {
        case "draft": return "مسودة"
        case "open": return "مفتوحة"
        case "in_review": return "قيد المراجعة"
        case "active": return "نشطة"
        case "completed": return "مكتملة"
        case "cancelled": return "ملغية"
        default: return status
        }
    }

    static func applicationStatus(_ status: String) -> String {
        switch status {
        case "pending": return "قيد الانتظار"
        case "approved": return "مقبول"
        case "rejected": return "مرفوض"
        case "withdrawn": return "منسحب"
        default: return status
        }
    }
}
