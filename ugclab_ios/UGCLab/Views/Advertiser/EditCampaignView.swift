import SwiftUI

struct EditCampaignView: View {
    let campaign: Campaign
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var requirements = ""
    @State private var budget = ""
    @State private var category = ""
    @State private var deadline = Date()
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                InputField(label: "عنوان الحملة", text: $title)
                InputField(label: "الوصف", text: $description)
                InputField(label: "المتطلبات", text: $requirements)
                InputField(label: "الميزانية (د.ع)", text: $budget, keyboardType: .numberPad)

                VStack(alignment: .trailing, spacing: 4) {
                    Text("التصنيف")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(AppColors.textSecondary)
                    TextField("مثال: تكنولوجيا, موضة, طعام", text: $category)
                        .font(.system(size: 14))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 12)
                        .background(AppColors.background)
                        .cornerRadius(AppTheme.cornerRadius)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                                .stroke(AppColors.border, lineWidth: 1)
                        )
                }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 13))
                        .foregroundColor(AppColors.error)
                }

                Button(action: save) {
                    if isSaving {
                        ProgressView().tint(.white)
                    } else {
                        Text("حفظ التغييرات")
                            .font(.system(size: 16, weight: .bold))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: AppTheme.buttonHeight)
                .background(AppColors.primary)
                .cornerRadius(AppTheme.cornerRadius)
                .disabled(isSaving)
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("تعديل الحملة")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            title = campaign.title
            description = campaign.description
            requirements = campaign.requirements ?? ""
            budget = "\(Int(campaign.budget))"
            category = campaign.category ?? ""
        }
    }

    private func save() {
        guard !title.isEmpty, !description.isEmpty, let budgetVal = Double(budget), budgetVal > 0 else {
            errorMessage = "يرجى ملء جميع الحقول المطلوبة"
            return
        }
        isSaving = true
        errorMessage = nil
        Task {
            do {
                _ = try await CampaignService.shared.updateCampaign(
                    id: campaign.id, title: title, description: description,
                    requirements: requirements.isEmpty ? nil : requirements,
                    budget: budgetVal,
                    category: category.isEmpty ? nil : category,
                    deadline: nil, status: nil
                )
                await MainActor.run { dismiss() }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isSaving = false }
            }
        }
    }
}
