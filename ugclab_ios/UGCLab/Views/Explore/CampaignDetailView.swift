import SwiftUI

struct CampaignDetailView: View {
    let campaign: Campaign

    @State private var showApply = false
    @State private var proposal = ""
    @State private var isApplying = false
    @State private var applyError: String?

    var body: some View {
        ScrollView {
            VStack(alignment: .trailing, spacing: 20) {
                VStack(alignment: .trailing, spacing: 8) {
                    Text(campaign.title)
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)

                    StatusBadge(status: campaign.status)

                    if let advertiserName = campaign.advertiserName {
                        HStack(spacing: 8) {
                            Text(advertiserName)
                                .font(.system(size: 13))
                                .foregroundColor(AppColors.textSecondary)
                            Image(systemName: "building.2.fill")
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.textSecondary)
                            Spacer()
                        }
                    }
                }

                Divider()

                VStack(alignment: .trailing, spacing: 12) {
                    Text("عن الحملة")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                    Text(campaign.description)
                        .font(.system(size: 14))
                        .foregroundColor(AppColors.textSecondary)
                }

                if let requirements = campaign.requirements {
                    VStack(alignment: .trailing, spacing: 12) {
                        Text("المتطلبات")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
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
                                .foregroundColor(AppColors.textPrimary)
                            Text("آخر موعد")
                                .font(.system(size: 11))
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                    if let category = campaign.category {
                        VStack(spacing: 4) {
                            Text(category)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(AppColors.textPrimary)
                            Text("التصنيف")
                                .font(.system(size: 11))
                                .foregroundColor(AppColors.textSecondary)
                        }
                    }
                }

                if campaign.isOpen {
                    Button(action: { showApply = true }) {
                        Text("تقدم للحملة")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: AppTheme.buttonHeight)
                            .background(AppColors.primary)
                            .cornerRadius(AppTheme.cornerRadius)
                    }
                }
            }
            .padding(AppTheme.largePadding)
        }
        .background(AppColors.background)
        .navigationTitle("تفاصيل الحملة")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showApply) {
            applySheet
        }
    }

    private var applySheet: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Text("قدم طلبك للحملة")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)

                TextEditor(text: $proposal)
                    .font(.system(size: 14))
                    .frame(height: 150)
                    .padding(8)
                    .background(AppColors.background)
                    .cornerRadius(AppTheme.cornerRadius)
                    .overlay(
                        RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                            .stroke(AppColors.border, lineWidth: 1)
                    )

                if let applyError {
                    Text(applyError)
                        .font(.system(size: 13))
                        .foregroundColor(AppColors.error)
                }

                Button(action: apply) {
                    if isApplying {
                        ProgressView().tint(.white)
                    } else {
                        Text("إرسال الطلب")
                            .font(.system(size: 16, weight: .bold))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: AppTheme.buttonHeight)
                .background(AppColors.primary)
                .cornerRadius(AppTheme.cornerRadius)
                .disabled(isApplying)
            }
            .padding()
            .presentationDetents([.medium])
        }
    }

    private func apply() {
        guard !proposal.trimmingCharacters(in: .whitespaces).isEmpty else {
            applyError = "الرجاء كتابة رسالة التقديم"
            return
        }
        isApplying = true
        applyError = nil
        Task {
            do {
                try await CampaignService.shared.applyToCampaign(campaignId: campaign.id, proposal: proposal)
                await MainActor.run {
                    showApply = false
                }
            } catch {
                await MainActor.run { applyError = error.localizedDescription }
            }
            await MainActor.run { isApplying = false }
        }
    }
}
