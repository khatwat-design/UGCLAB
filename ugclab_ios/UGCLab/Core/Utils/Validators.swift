struct Validators {
    static func required(_ value: String?, field: String = "هذا الحقل") -> String? {
        guard let value = value?.trimmingCharacters(in: .whitespacesAndNewlines), !value.isEmpty else {
            return "\(field) مطلوب"
        }
        return nil
    }

    static func email(_ value: String?) -> String? {
        guard let value = value?.trimmingCharacters(in: .whitespacesAndNewlines), !value.isEmpty else {
            return "البريد الإلكتروني مطلوب"
        }
        let regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
        guard (try? regex.wholeMatch(in: value)) != nil else { return "البريد الإلكتروني غير صالح" }
        return nil
    }

    static func password(_ value: String?) -> String? {
        guard let value, !value.isEmpty else { return "كلمة المرور مطلوبة" }
        if value.count < 8 { return "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }
        return nil
    }

    static func iraqiPhone(_ value: String?) -> String? {
        guard let value = value?.trimmingCharacters(in: .whitespacesAndNewlines), !value.isEmpty else {
            return "رقم الهاتف مطلوب"
        }
        let regex = /^07[3-9]\d{8}$/
        guard (try? regex.wholeMatch(in: value)) != nil else { return "رقم هاتف عراقي صالح (07XXXXXXXX)" }
        return nil
    }

    static func confirmPassword(_ value: String?, password: String) -> String? {
        guard let value, !value.isEmpty else { return "تأكيد كلمة المرور مطلوب" }
        if value != password { return "كلمة المرور غير متطابقة" }
        return nil
    }
}
