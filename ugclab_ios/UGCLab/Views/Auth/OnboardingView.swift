import SwiftUI

struct OnboardingView: View {
    @State private var currentPage = 0

    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                OnboardingPage(
                    image: "person.2.fill",
                    title: "منصة المحتوى الأولى في العراق",
                    description: "تواصل مع المبدعين وأصحاب العلامات التجارية في مكان واحد",
                    tag: 0
                )
                OnboardingPage(
                    image: "video.fill",
                    title: "لا تفوت فرصة التعاون",
                    description: "اكتشف حملات ممولة وابدأ رحلة الإبداع مع UGCLab",
                    tag: 1
                )
                OnboardingPage(
                    image: "dollarsign.circle.fill",
                    title: "حول شغفك إلى دخل",
                    description: "سواء كنت مبدعاً أو معلناً، حقق أهدافك معنا",
                    tag: 2
                )
            }
            .tabViewStyle(.page(indexDisplayMode: .never))

            HStack(spacing: 8) {
                ForEach(0..<3) { i in
                    Circle()
                        .fill(currentPage == i ? AppColors.primary : AppColors.border)
                        .frame(width: 8, height: 8)
                }
            }
            .padding(.bottom, 24)

            if currentPage == 2 {
                VStack(spacing: 12) {
                    NavigationLink(destination: LoginView()) {
                        Text("تسجيل الدخول")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: AppTheme.buttonHeight)
                            .background(AppColors.primary)
                            .cornerRadius(AppTheme.cornerRadius)
                    }

                    NavigationLink(destination: RegisterView()) {
                        Text("إنشاء حساب جديد")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(AppColors.primary)
                            .frame(maxWidth: .infinity)
                            .frame(height: AppTheme.buttonHeight)
                            .background(AppColors.primary.opacity(0.1))
                            .cornerRadius(AppTheme.cornerRadius)
                    }
                }
                .padding(.horizontal, AppTheme.largePadding)
            } else {
                Button("التالي") {
                    withAnimation { currentPage += 1 }
                }
                .font(.system(size: 16, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: AppTheme.buttonHeight)
                .background(AppColors.primary)
                .cornerRadius(AppTheme.cornerRadius)
                .padding(.horizontal, AppTheme.largePadding)
            }
        }
        .padding(.bottom, 32)
        .navigationBarHidden(true)
    }
}

struct OnboardingPage: View {
    let image: String
    let title: String
    let description: String
    let tag: Int

    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: image)
                .font(.system(size: 80))
                .foregroundColor(AppColors.primary)
                .padding(.bottom, 16)

            Text(title)
                .font(.system(size: 24, weight: .bold))
                .foregroundColor(AppColors.textPrimary)
                .multilineTextAlignment(.center)

            Text(description)
                .font(.system(size: 15))
                .foregroundColor(AppColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
        }
        .tag(tag)
    }
}
