import SwiftUI

struct LoadingView: View {
    var message: String = "جار التحميل..."

    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
                .tint(AppColors.primary)
            Text(message)
                .font(.system(size: 14))
                .foregroundColor(AppColors.textSecondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.background)
    }
}
