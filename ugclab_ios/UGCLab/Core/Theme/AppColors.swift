import SwiftUI

struct AppColors {
    static let primary = Color(hex: "#3B82F6")
    static let primaryDark = Color(hex: "#60A5FA")
    static let background = Color(hex: "#F9FAFB")
    static let surface = Color.white
    static let textPrimary = Color(hex: "#111827")
    static let textSecondary = Color(hex: "#6B7280")
    static let border = Color(hex: "#E5E7EB")

    static let backgroundDark = Color(hex: "#0F0F23")
    static let surfaceDark = Color(hex: "#1A1A2E")
    static let textPrimaryDark = Color(hex: "#F3F4F6")
    static let textSecondaryDark = Color(hex: "#9CA3AF")
    static let borderDark = Color(hex: "#374151")

    static let success = Color(hex: "#10B981")
    static let warning = Color(hex: "#F59E0B")
    static let error = Color(hex: "#EF4444")
    static let info = Color(hex: "#3B82F6")
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = ((int >> 24) & 0xFF, (int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue: Double(b) / 255, opacity: Double(a) / 255)
    }
}
