import SwiftUI

struct AdvertiserDashboardView: View {
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
                        StatsCard(title: "الطلبات", value: "\(dashboard["total_applications"] ?? "0")", icon: "doc.text.fill", color: .blue)
                        StatsCard(title: "إجمالي الإنفاق", value: Formatters.compactCurrency(dashboard["total_spent"] as? Double ?? 0), icon: "dollarsign.circle.fill", color: .orange)
                        StatsCard(title: "المبدعون", value: "\(dashboard["total_creators"] ?? "0")", icon: "person.2.fill", color: .purple)
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
                let result = try await CampaignService.shared.getAdvertiserDashboard()
                await MainActor.run { dashboard = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}
