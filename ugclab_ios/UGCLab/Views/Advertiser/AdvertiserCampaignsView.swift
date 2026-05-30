import SwiftUI

struct AdvertiserCampaignsView: View {
    @State private var campaigns: [Campaign] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                HStack {
                    NavigationLink(destination: CreateCampaignView()) {
                        Label("حملة جديدة", systemImage: "plus")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(AppColors.primary)
                            .cornerRadius(AppTheme.cornerRadius)
                    }
                    Spacer()
                }
                .padding(.horizontal)

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
                        NavigationLink(destination: AdvertiserCampaignDetailView(campaign: campaign)) {
                            CampaignCard(campaign: campaign)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.vertical)
        }
        .background(AppColors.background)
        .navigationTitle("حملاتي")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadCampaigns() }
    }

    private func loadCampaigns() {
        isLoading = true
        Task {
            do {
                let result = try await CampaignService.shared.getAdvertiserCampaigns()
                await MainActor.run { campaigns = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}
