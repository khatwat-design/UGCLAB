import SwiftUI

struct StatsCard: View {
    let title: String
    let value: String
    var icon: String? = nil
    var color: Color = AppColors.primary

    var body: some View {
        VStack(spacing: 8) {
            if let icon {
                Image(systemName: icon)
                    .font(.system(size: 22))
                    .foregroundColor(color)
            }
            Text(value)
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(AppColors.textPrimary)
            Text(title)
                .font(.system(size: 11))
                .foregroundColor(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .padding(.horizontal, 8)
        .background(AppColors.surface)
        .cornerRadius(AppTheme.cardCornerRadius)
    }
}
