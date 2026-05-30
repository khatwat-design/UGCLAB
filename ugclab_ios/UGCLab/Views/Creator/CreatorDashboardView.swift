import SwiftUI

struct CreatorDashboardView: View {
    @State private var dashboard: [String: Any] = [:]
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if isLoading {
                    ForEach(0..<4, id: \.self) { _ in SkeletonCard() }
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadDashboard() }
                } else {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        StatsCard(title: "الحملات النشطة", value: "\(dashboard["active_campaigns"] ?? "0")", icon: "play.fill", color: .green)
                        StatsCard(title: "الطلبات المعلقة", value: "\(dashboard["pending_applications"] ?? "0")", icon: "clock.fill", color: .orange)
                        StatsCard(title: "إجمالي الأرباح", value: Formatters.compactCurrency(dashboard["total_earnings"] as? Double ?? 0), icon: "dollarsign.circle.fill", color: .blue)
                        StatsCard(title: "الريلز", value: "\(dashboard["total_reels"] ?? "0")", icon: "video.fill", color: .purple)
                    }
                    .padding(.horizontal)
                }
            }
            .padding(.vertical)
        }
        .background(AppColors.background)
        .navigationTitle("لوحة التحكم")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadDashboard() }
    }

    private func loadDashboard() {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let result = try await CampaignService.shared.getDashboard()
                await MainActor.run { dashboard = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}
