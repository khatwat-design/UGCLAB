import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appState: AppState
    @State private var showLogoutAlert = false

    var body: some View {
        List {
            Section("الحساب") {
                NavigationLink(destination: EditProfileView()) {
                    Label("تعديل الملف الشخصي", systemImage: "person.fill")
                }
                NavigationLink(destination: ChangePasswordView()) {
                    Label("تغيير كلمة المرور", systemImage: "lock.fill")
                }
            }

            Section("التطبيق") {
                NavigationLink(destination: NotificationsView()) {
                    Label("الإشعارات", systemImage: "bell.fill")
                }
                Label("النسخة 1.0.0", systemImage: "info.circle.fill")
                    .foregroundColor(AppColors.textSecondary)
            }

            Section {
                Button(role: .destructive) {
                    showLogoutAlert = true
                } label: {
                    Label("تسجيل الخروج", systemImage: "rectangle.portrait.and.arrow.right.fill")
                }
            }
        }
        .listStyle(.insetGrouped)
        .navigationTitle("الإعدادات")
        .navigationBarTitleDisplayMode(.inline)
        .alert("تسجيل الخروج", isPresented: $showLogoutAlert) {
            Button("تسجيل الخروج", role: .destructive) {
                Task { try? await AuthService.shared.logout() }
                appState.logout()
            }
            Button("إلغاء", role: .cancel) {}
        } message: {
            Text("هل أنت متأكد من تسجيل الخروج؟")
        }
    }
}
