import SwiftUI

struct CreatorApplicationsView: View {
    @State private var applications: [Application] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                if isLoading {
                    ForEach(0..<5, id: \.self) { _ in SkeletonCard() }
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadApplications() }
                } else if applications.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "doc.text.magnifyingglass")
                            .font(.system(size: 36))
                            .foregroundColor(AppColors.textSecondary)
                        Text("لا توجد طلبات")
                            .font(.system(size: 15))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .padding(.top, 60)
                } else {
                    ForEach(applications) { app in
                        VStack(alignment: .trailing, spacing: 8) {
                            HStack {
                                StatusBadge(status: app.status)
                                Spacer()
                                Text(app.campaignTitle)
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(AppColors.textPrimary)
                            }
                            if let proposal = app.proposal {
                                Text(proposal)
                                    .font(.system(size: 12))
                                    .foregroundColor(AppColors.textSecondary)
                                    .lineLimit(2)
                            }
                            Text(Formatters.relativeTime(app.createdAt))
                                .font(.system(size: 11))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        .padding()
                        .background(AppColors.surface)
                        .cornerRadius(AppTheme.cardCornerRadius)
                    }
                }
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("طلباتي")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadApplications() }
    }

    private func loadApplications() {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let result = try await CampaignService.shared.getMyApplications()
                await MainActor.run { applications = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}
