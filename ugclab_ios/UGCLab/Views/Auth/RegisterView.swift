import SwiftUI

struct RegisterView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var appState: AppState

    @State private var step = 1
    @State private var name = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var role: String = "creator"
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var nameError: String?
    @State private var emailError: String?
    @State private var phoneError: String?
    @State private var passwordError: String?
    @State private var confirmError: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                HStack {
                    ForEach(1...3, id: \.self) { i in
                        Circle()
                            .fill(i <= step ? AppColors.primary : AppColors.border)
                            .frame(width: 10, height: 10)
                        if i < 3 {
                            Rectangle()
                                .fill(i < step ? AppColors.primary : AppColors.border)
                                .frame(height: 2)
                        }
                    }
                }
                .padding(.top, 16)

                if step == 1 {
                    step1View
                } else if step == 2 {
                    step2View
                } else {
                    step3View
                }
            }
            .padding(AppTheme.largePadding)
        }
        .background(AppColors.background)
        .navigationTitle("إنشاء حساب")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var step1View: some View {
        VStack(spacing: 20) {
            Text("اختر نوع الحساب")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(AppColors.textPrimary)

            Button {
                role = "creator"
            } label: {
                HStack {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("مبدع")
                            .font(.system(size: 16, weight: .bold))
                        Text("أنشئ محتوى واربح من تعاوناتك")
                            .font(.system(size: 12))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                    Image(systemName: role == "creator" ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(role == "creator" ? AppColors.primary : AppColors.border)
                }
                .padding()
                .background(AppColors.surface)
                .cornerRadius(AppTheme.cornerRadius)
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                        .stroke(role == "creator" ? AppColors.primary : AppColors.border, lineWidth: 1.5)
                )
            }

            Button {
                role = "advertiser"
            } label: {
                HStack {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("معلن")
                            .font(.system(size: 16, weight: .bold))
                        Text("سوق لمنتجك وتواصل مع المبدعين")
                            .font(.system(size: 12))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    Spacer()
                    Image(systemName: role == "advertiser" ? "checkmark.circle.fill" : "circle")
                        .foregroundColor(role == "advertiser" ? AppColors.primary : AppColors.border)
                }
                .padding()
                .background(AppColors.surface)
                .cornerRadius(AppTheme.cornerRadius)
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                        .stroke(role == "advertiser" ? AppColors.primary : AppColors.border, lineWidth: 1.5)
                )
            }

            nextButton
        }
    }

    private var step2View: some View {
        VStack(spacing: 16) {
            Text("المعلومات الأساسية")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(AppColors.textPrimary)

            InputField(label: "الاسم الكامل", text: $name, error: nameError, icon: "person.fill", onChange: { nameError = nil })
            InputField(label: "البريد الإلكتروني", text: $email, error: emailError, keyboardType: .emailAddress, icon: "envelope.fill", onChange: { emailError = nil })
            InputField(label: "رقم الهاتف", text: $phone, error: phoneError, keyboardType: .phonePad, icon: "phone.fill", onChange: { phoneError = nil })

            HStack(spacing: 12) {
                Button(action: { step = 1 }) {
                    Text("رجوع")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(AppColors.primary)
                        .frame(maxWidth: .infinity)
                        .frame(height: AppTheme.buttonHeight)
                        .background(AppColors.primary.opacity(0.1))
                        .cornerRadius(AppTheme.cornerRadius)
                }
                nextButton
            }
        }
    }

    private var step3View: some View {
        VStack(spacing: 16) {
            Text("كلمة المرور")
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(AppColors.textPrimary)

            InputField(label: "كلمة المرور", text: $password, error: passwordError, isSecure: true, icon: "lock.fill", onChange: { passwordError = nil })
            InputField(label: "تأكيد كلمة المرور", text: $confirmPassword, error: confirmError, isSecure: true, icon: "lock.fill", onChange: { confirmError = nil })

            if let errorMessage {
                Text(errorMessage)
                    .font(.system(size: 13))
                    .foregroundColor(AppColors.error)
            }

            HStack(spacing: 12) {
                Button(action: { step = 2 }) {
                    Text("رجوع")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(AppColors.primary)
                        .frame(maxWidth: .infinity)
                        .frame(height: AppTheme.buttonHeight)
                        .background(AppColors.primary.opacity(0.1))
                        .cornerRadius(AppTheme.cornerRadius)
                }

                Button(action: register) {
                    if isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text("تسجيل")
                            .font(.system(size: 16, weight: .bold))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: AppTheme.buttonHeight)
                .background(AppColors.primary)
                .cornerRadius(AppTheme.cornerRadius)
                .disabled(isLoading)
            }
        }
    }

    private var nextButton: some View {
        Button(action: { step += 1 }) {
            Text("التالي")
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: AppTheme.buttonHeight)
                .background(AppColors.primary)
                .cornerRadius(AppTheme.cornerRadius)
        }
    }

    private func register() {
        nameError = Validators.required(name, field: "الاسم")
        emailError = Validators.email(email)
        phoneError = Validators.iraqiPhone(phone)
        passwordError = Validators.password(password)
        confirmError = Validators.confirmPassword(confirmPassword, password: password)
        guard nameError == nil, emailError == nil, phoneError == nil,
              passwordError == nil, confirmError == nil else { return }

        isLoading = true
        errorMessage = nil
        Task {
            do {
                let result = try await AuthService.shared.register(
                    name: name, email: email, password: password,
                    phone: phone, role: role
                )
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
