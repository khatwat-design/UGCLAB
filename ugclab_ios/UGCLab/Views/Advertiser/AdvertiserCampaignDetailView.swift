import SwiftUI

struct AdvertiserCampaignDetailView: View {
    let campaign: Campaign

    @State private var applications: [Application] = []
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var showEdit = false

    var body: some View {
        ScrollView {
            VStack(alignment: .trailing, spacing: 20) {
                VStack(alignment: .trailing, spacing: 8) {
                    HStack {
                        NavigationLink(destination: EditCampaignView(campaign: campaign)) {
                            Text("تعديل")
                                .font(.system(size: 14))
                                .foregroundColor(AppColors.primary)
                        }
                        Spacer()
                        Text(campaign.title)
                            .font(.system(size: 22, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                    }
                    StatusBadge(status: campaign.status)
                }

                Divider()

                VStack(alignment: .trailing, spacing: 12) {
                    Text("عن الحملة")
                        .font(.system(size: 16, weight: .bold))
                    Text(campaign.description)
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.textSecondary)
                }

                if let requirements = campaign.requirements {
                    VStack(alignment: .trailing, spacing: 12) {
                        Text("المتطلبات")
                            .font(.system(size: 16, weight: .bold))
                        Text(requirements)
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textSecondary)
                    }
                }

                HStack(spacing: 24) {
                    VStack(spacing: 4) {
                        Text(Formatters.currency(campaign.budget))
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(AppColors.primary)
                        Text("الميزانية")
                            .font(.system(size: 11))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    if let deadline = campaign.deadline {
                        VStack(spacing: 4) {
                            Text(Formatters.date(deadline))
                                .font(.system(size: 14, weight: .medium))
                            Text("آخر موعد")
                                .font(.system(size: 11))
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                    VStack(spacing: 4) {
                        Text("\(applications.count)")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(AppColors.primary)
                        Text("الطلبات")
                            .font(.system(size: 11))
                            .foregroundColor(AppColors.textSecondary)
                    }
                }

                if !applications.isEmpty {
                    VStack(alignment: .trailing, spacing: 12) {
                        Text("الطلبات المقدمة")
                            .font(.system(size: 16, weight: .bold))
                        ForEach(applications) { app in
                            ApplicationCard(application: app, campaignId: campaign.id)
                        }
                    }
                }
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("تفاصيل الحملة")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadApplications() }
    }

    private func loadApplications() {
        isLoading = true
        Task {
            do {
                let result = try await CampaignService.shared.getCampaignApplications(campaignId: campaign.id)
                await MainActor.run { applications = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}

struct ApplicationCard: View {
    let application: Application
    let campaignId: String

    var body: some View {
        VStack(alignment: .trailing, spacing: 8) {
            HStack {
                StatusBadge(status: application.status)
                Spacer()
                Text(application.creatorName)
                    .font(.system(size: 15, weight: .bold))
            }
            if let proposal = application.proposal {
                Text(proposal)
                    .font(.system(size: 12))
                    .foregroundColor(AppColors.textSecondary)
                    .lineLimit(3)
            }
            if application.isPending {
                HStack(spacing: 8) {
                    Button(action: reject) {
                        Text("رفض")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.red)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(6)
                    }
                    Button(action: approve) {
                        Text("قبول")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundColor(.green)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.green.opacity(0.1))
                            .cornerRadius(6)
                    }
                }
            }
        }
        .padding()
        .background(AppColors.surface)
        .cornerRadius(AppTheme.cardCornerRadius)
    }

    private func approve() {
        Task {
            try? await CampaignService.shared.approveApplication(campaignId: campaignId, applicationId: application.id)
        }
    }

    private func reject() {
        Task {
            try? await CampaignService.shared.rejectApplication(campaignId: campaignId, applicationId: application.id)
        }
    }
}
