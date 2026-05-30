import SwiftUI

struct BadgeView: View {
    let text: String
    var color: Color = AppColors.primary
    var isFilled: Bool = true

    var body: some View {
        Text(text)
            .font(.system(size: 11, weight: .medium))
            .foregroundColor(isFilled ? .white : color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(isFilled ? color : color.opacity(0.12))
            .clipShape(Capsule())
    }
}

struct StatusBadge: View {
    let status: String

    var body: some View {
        BadgeView(text: Formatters.campaignStatus(status), color: statusColor, isFilled: false)
    }

    private var statusColor: Color {
        switch status {
        case "open", "approved", "active": return .green
        case "in_review", "pending": return .orange
        case "completed": return .blue
        case "rejected", "cancelled": return .red
        case "draft": return .gray
        default: return AppColors.primary
        }
    }
}
