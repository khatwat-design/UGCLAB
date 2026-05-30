import SwiftUI

struct ExploreView: View {
    @State private var campaigns: [Campaign] = []
    @State private var searchText = ""
    @State private var isLoading = true
    @State private var errorMessage: String?

    var filteredCampaigns: [Campaign] {
        guard !searchText.isEmpty else { return campaigns }
        return campaigns.filter { $0.title.contains(searchText) || ($0.description.contains(searchText)) }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(AppColors.textSecondary)
                    TextField("ابحث عن حملات...", text: $searchText)
                        .font(.system(size: 14))
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(AppColors.surface)
                .cornerRadius(AppTheme.cornerRadius)
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                        .stroke(AppColors.border, lineWidth: 1)
                )
                .padding(.horizontal, AppTheme.mediumPadding)

                if isLoading {
                    ForEach(0..<5, id: \.self) { _ in SkeletonCard() }
                        .padding(.horizontal, AppTheme.mediumPadding)
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadCampaigns() }
                } else if filteredCampaigns.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "bag.slash")
                            .font(.system(size: 36))
                            .foregroundColor(AppColors.textSecondary)
                        Text("لا توجد حملات")
                            .font(.system(size: 15))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .padding(.top, 60)
                } else {
                    LazyVStack(spacing: 12) {
                        ForEach(filteredCampaigns) { campaign in
                            NavigationLink(destination: CampaignDetailView(campaign: campaign)) {
                                CampaignCard(campaign: campaign)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(.horizontal, AppTheme.mediumPadding)
                }
            }
            .padding(.vertical)
        }
        .background(AppColors.background)
        .navigationTitle("استكشاف")
        .navigationBarTitleDisplayMode(.large)
        .onAppear { loadCampaigns() }
    }

    private func loadCampaigns() {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let result = try await CampaignService.shared.exploreCampaigns()
                await MainActor.run {
                    campaigns = result
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}
