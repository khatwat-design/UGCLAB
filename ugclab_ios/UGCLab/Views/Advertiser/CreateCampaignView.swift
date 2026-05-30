import SwiftUI

struct CreateCampaignView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var description = ""
    @State private var requirements = ""
    @State private var budget = ""
    @State private var category = ""
    @State private var deadline = Date().addingTimeInterval(30*24*3600)
    @State private var showDatePicker = false
    @State private var isCreating = false
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

                VStack(alignment: .trailing, spacing: 4) {
                    Text("آخر موعد")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(AppColors.textSecondary)
                    Button(action: { showDatePicker.toggle() }) {
                        HStack {
                            Image(systemName: "calendar")
                                .foregroundColor(AppColors.primary)
                            Spacer()
                            Text(Formatters.date(ISO8601DateFormatter().string(from: deadline)))
                                .foregroundColor(AppColors.textPrimary)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 12)
                        .background(AppColors.background)
                        .cornerRadius(AppTheme.cornerRadius)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                                .stroke(AppColors.border, lineWidth: 1)
                        )
                    }
                }

                if showDatePicker {
                    DatePicker("", selection: $deadline, displayedComponents: .date)
                        .datePickerStyle(.graphical)
                        .environment(\.locale, Locale(identifier: "ar"))
                }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 13))
                        .foregroundColor(AppColors.error)
                }

                Button(action: createCampaign) {
                    if isCreating {
                        ProgressView().tint(.white)
                    } else {
                        Text("إنشاء الحملة")
                            .font(.system(size: 16, weight: .bold))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: AppTheme.buttonHeight)
                .background(AppColors.primary)
                .cornerRadius(AppTheme.cornerRadius)
                .disabled(isCreating)
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("حملة جديدة")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func createCampaign() {
        guard !title.isEmpty, !description.isEmpty, let budgetVal = Double(budget), budgetVal > 0 else {
            errorMessage = "يرجى ملء جميع الحقول المطلوبة"
            return
        }
        isCreating = true
        errorMessage = nil
        let df = ISO8601DateFormatter()
        df.formatOptions = [.withInternetDateTime]
        Task {
            do {
                _ = try await CampaignService.shared.createCampaign(
                    title: title, description: description,
                    requirements: requirements.isEmpty ? nil : requirements,
                    budget: budgetVal,
                    category: category.isEmpty ? nil : category,
                    deadline: df.string(from: deadline)
                )
                await MainActor.run { dismiss() }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isCreating = false }
            }
        }
    }
}
