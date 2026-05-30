import SwiftUI

struct AdvertiserHomeView: View {
    @EnvironmentObject var appState: AppState
    @State private var user: User?
    @State private var isLoading = true

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    if isLoading {
                        VStack(spacing: 12) {
                            SkeletonLoader(width: 60, height: 60)
                            SkeletonLoader(width: 150, height: 20)
                        }
                        .padding(.top, 20)
                        ForEach(0..<3, id: \.self) { _ in SkeletonCard() }
                    } else if let user {
                        VStack(spacing: 12) {
                            AsyncImage(url: URL(string: user.avatarURL ?? "")) { image in
                                image.resizable().scaledToFill()
                            } placeholder: {
                                Circle().fill(AppColors.border)
                            }
                            .frame(width: 60, height: 60)
                            .clipShape(Circle())

                            Text(user.name)
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(AppColors.textPrimary)

                            if user.isVerified {
                                BadgeView(text: "موثق", color: .green)
                            }
                        }
                        .padding(.top, 20)
                    }

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        NavigationLink(destination: AdvertiserDashboardView()) {
                            StatsCard(title: "الإحصائيات", value: "لوحة التحكم", icon: "chart.bar.fill", color: AppColors.primary)
                        }
                        NavigationLink(destination: AdvertiserCampaignsView()) {
                            StatsCard(title: "الحملات", value: "إدارة", icon: "megaphone.fill", color: .orange)
                        }
                        NavigationLink(destination: AdvertiserCreatorsView()) {
                            StatsCard(title: "المبدعين", value: "استكشاف", icon: "person.2.fill", color: .purple)
                        }
                        NavigationLink(destination: AdvertiserWalletView()) {
                            StatsCard(title: "المحفظة", value: "الرصيد", icon: "wallet.pass.fill", color: .green)
                        }
                    }
                    .padding(.horizontal)

                    VStack(spacing: 12) {
                        NavigationLink(destination: CreateCampaignView()) {
                            menuRow(icon: "plus.circle.fill", title: "حملة جديدة", color: AppColors.primary)
                        }
                        NavigationLink(destination: AdvertiserKYCView()) {
                            menuRow(icon: "person.badge.shield.checkmark.fill", title: "التحقق من الهوية", color: .indigo)
                        }
                        NavigationLink(destination: SettingsView()) {
                            menuRow(icon: "gearshape.fill", title: "الإعدادات", color: .gray)
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(AppColors.background)
            .navigationTitle("الرئيسية")
            .navigationBarTitleDisplayMode(.large)
            .onAppear { loadProfile() }
        }
    }

    private func menuRow(icon: String, title: String, color: Color) -> some View {
        HStack {
            Image(systemName: "chevron.left")
                .font(.system(size: 12))
                .foregroundColor(AppColors.textSecondary)
            Spacer()
            Text(title)
                .font(.system(size: 15))
                .foregroundColor(AppColors.textPrimary)
            Image(systemName: icon)
                .font(.system(size: 18))
                .foregroundColor(color)
        }
        .padding()
        .background(AppColors.surface)
        .cornerRadius(AppTheme.cornerRadius)
    }

    private func loadProfile() {
        Task {
            do {
                let user = try await AuthService.shared.getProfile()
                await MainActor.run { self.user = user; isLoading = false }
            } catch {
                await MainActor.run { isLoading = false }
            }
        }
    }
}
