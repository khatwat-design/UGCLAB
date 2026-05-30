import SwiftUI

struct ChangePasswordView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var currentPassword = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                InputField(label: "كلمة المرور الحالية", text: $currentPassword, isSecure: true, icon: "lock.fill")
                InputField(label: "كلمة المرور الجديدة", text: $newPassword, isSecure: true, icon: "lock.fill")
                InputField(label: "تأكيد كلمة المرور الجديدة", text: $confirmPassword, isSecure: true, icon: "lock.fill")

                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 13))
                        .foregroundColor(AppColors.error)
                }

                Button(action: save) {
                    if isSaving {
                        ProgressView().tint(.white)
                    } else {
                        Text("تغيير كلمة المرور")
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
        .navigationTitle("تغيير كلمة المرور")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func save() {
        guard !currentPassword.isEmpty, !newPassword.isEmpty else {
            errorMessage = "جميع الحقول مطلوبة"
            return
        }
        guard newPassword == confirmPassword else {
            errorMessage = "كلمة المرور غير متطابقة"
            return
        }
        guard newPassword.count >= 8 else {
            errorMessage = "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
            return
        }
        isSaving = true
        errorMessage = nil
        Task {
            do {
                try await AuthService.shared.updatePassword(currentPassword: currentPassword, newPassword: newPassword)
                await MainActor.run { dismiss() }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isSaving = false }
            }
        }
    }
}
