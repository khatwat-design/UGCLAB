import SwiftUI

struct CreatorCampaignsView: View {
    @State private var campaigns: [Campaign] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                if isLoading {
                    ForEach(0..<5, id: \.self) { _ in SkeletonCard() }
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadCampaigns() }
                } else if campaigns.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "megaphone.slash")
                            .font(.system(size: 36))
                            .foregroundColor(AppColors.textSecondary)
                        Text("لا توجد حملات")
                            .font(.system(size: 15))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .padding(.top, 60)
                } else {
                    ForEach(campaigns) { campaign in
                        NavigationLink(destination: CampaignDetailView(campaign: campaign)) {
                            CampaignCard(campaign: campaign)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("الحملات")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadCampaigns() }
    }

    private func loadCampaigns() {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let result = try await CampaignService.shared.getCreatorCampaigns()
                await MainActor.run { campaigns = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}
