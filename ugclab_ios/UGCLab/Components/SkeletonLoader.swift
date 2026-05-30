import SwiftUI

struct SkeletonLoader: View {
    var width: CGFloat = 120
    var height: CGFloat = 16

    @State private var opacity: Double = 0.3

    var body: some View {
        RoundedRectangle(cornerRadius: 4)
            .fill(AppColors.border)
            .frame(width: width, height: height)
            .opacity(opacity)
            .onAppear {
                withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) {
                    opacity = 0.7
                }
            }
    }
}

struct SkeletonCard: View {
    var body: some View {
        VStack(alignment: .trailing, spacing: 12) {
            SkeletonLoader(width: 120, height: 20)
            SkeletonLoader(width: .infinity, height: 14)
            SkeletonLoader(width: 80, height: 14)
        }
        .padding(AppTheme.mediumPadding)
        .background(AppColors.surface)
        .cornerRadius(AppTheme.cardCornerRadius)
    }
}
