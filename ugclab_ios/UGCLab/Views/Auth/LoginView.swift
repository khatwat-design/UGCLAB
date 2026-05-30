import SwiftUI

struct LoginView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var appState: AppState

    @State private var email = ""
    @State private var password = ""
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var emailError: String?
    @State private var passwordError: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Image(systemName: "person.circle.fill")
                    .font(.system(size: 64))
                    .foregroundColor(AppColors.primary)
                    .padding(.top, 32)

                Text("تسجيل الدخول")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)

                VStack(spacing: 16) {
                    InputField(label: "البريد الإلكتروني", text: $email, error: emailError, keyboardType: .emailAddress, icon: "envelope.fill", onChange: { emailError = nil })
                    InputField(label: "كلمة المرور", text: $password, error: passwordError, isSecure: true, icon: "lock.fill", onChange: { passwordError = nil })
                }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 13))
                        .foregroundColor(AppColors.error)
                        .multilineTextAlignment(.center)
                }

                Button(action: login) {
                    if isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text("تسجيل الدخول")
                            .font(.system(size: 16, weight: .bold))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: AppTheme.buttonHeight)
                .background(AppColors.primary)
                .cornerRadius(AppTheme.cornerRadius)
                .disabled(isLoading)

                Spacer()
            }
            .padding(AppTheme.largePadding)
        }
        .background(AppColors.background)
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(false)
    }

    private func login() {
        emailError = Validators.email(email)
        passwordError = Validators.password(password)
        guard emailError == nil, passwordError == nil else { return }

        isLoading = true
        errorMessage = nil
        Task {
            do {
                let result = try await AuthService.shared.login(email: email, password: password)
                await MainActor.run {
                    appState.login(token: result.token, role: UserRole(rawValue: result.user.role) ?? .creator)
                }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription }
            }
            await MainActor.run { isLoading = false }
        }
    }
}

struct InputField: View {
    let label: String
    @Binding var text: String
    var error: String?
    var isSecure: Bool = false
    var keyboardType: UIKeyboardType = .default
    var icon: String? = nil
    var onChange: (() -> Void)? = nil

    var body: some View {
        VStack(alignment: .trailing, spacing: 4) {
            Text(label)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(AppColors.textSecondary)

            HStack {
                if isSecure {
                    SecureField(label, text: $text)
                        .onChange(of: text) { _ in onChange?() }
                } else {
                    TextField(label, text: $text)
                        .keyboardType(keyboardType)
                        .onChange(of: text) { _ in onChange?() }
                }
                if let icon {
                    Image(systemName: icon)
                        .foregroundColor(AppColors.textSecondary)
                        .font(.system(size: 14))
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 12)
            .background(AppColors.background)
            .cornerRadius(AppTheme.cornerRadius)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                    .stroke(error != nil ? AppColors.error : AppColors.border, lineWidth: 1)
            )

            if let error {
                Text(error)
                    .font(.system(size: 11))
                    .foregroundColor(AppColors.error)
            }
        }
    }
}
