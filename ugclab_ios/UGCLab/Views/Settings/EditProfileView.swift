import SwiftUI

struct EditProfileView: View {
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var bio = ""
    @State private var isSaving = false
    @State private var errorMessage: String?
    @State private var showImagePicker = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                Button(action: { showImagePicker = true }) {
                    ZStack {
                        Circle()
                            .fill(AppColors.border)
                            .frame(width: 80, height: 80)
                        Image(systemName: "camera.fill")
                            .font(.system(size: 24))
                            .foregroundColor(AppColors.textSecondary)
                    }
                }

                InputField(label: "الاسم الكامل", text: $name, icon: "person.fill")

                VStack(alignment: .trailing, spacing: 4) {
                    Text("السيرة الذاتية")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(AppColors.textSecondary)
                    TextEditor(text: $bio)
                        .font(.system(size: 14))
                        .frame(height: 120)
                        .padding(8)
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
                        Text("حفظ")
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
        .navigationTitle("تعديل الملف الشخصي")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadProfile() }
        .sheet(isPresented: $showImagePicker) {}
    }

    private func loadProfile() {
        Task {
            do {
                let user = try await AuthService.shared.getProfile()
                await MainActor.run { name = user.name; bio = user.bio ?? "" }
            } catch {}
        }
    }

    private func save() {
        guard !name.isEmpty else { errorMessage = "الاسم مطلوب"; return }
        isSaving = true
        errorMessage = nil
        Task {
            do {
                _ = try await AuthService.shared.updateProfile(name: name, bio: bio)
                await MainActor.run { dismiss() }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isSaving = false }
            }
        }
    }
}
