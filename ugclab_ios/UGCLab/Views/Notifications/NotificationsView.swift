import SwiftUI

struct NotificationsView: View {
    @State private var notifications: [AppNotification] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                if isLoading {
                    ForEach(0..<5, id: \.self) { _ in SkeletonCard() }
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadNotifications() }
                } else if notifications.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "bell.slash.fill")
                            .font(.system(size: 48))
                            .foregroundColor(AppColors.textSecondary)
                        Text("لا توجد إشعارات")
                            .font(.system(size: 15))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .padding(.top, 80)
                } else {
                    ForEach(notifications) { notification in
                        NotificationRow(notification: notification)
                    }
                }
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("الإشعارات")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadNotifications() }
    }

    private func loadNotifications() {
        isLoading = true
        Task {
            do {
                let response = try await APIClient.shared.get(APIEndpoint.notifications, query: ["per_page": 50])
                let items: [AppNotification] = {
                    guard let data = try? JSONSerialization.data(withJSONObject: response["data"] ?? response["notifications"] ?? []),
                          let n = try? JSONDecoder().decode([AppNotification].self, from: data) else { return [] }
                    return n
                }()
                await MainActor.run { notifications = items; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}

struct NotificationRow: View {
    let notification: AppNotification

    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(notification.isRead ? AppColors.border : AppColors.primary)
                .frame(width: 8, height: 8)

            VStack(alignment: .trailing, spacing: 4) {
                Text(notification.title)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)
                Text(notification.body)
                    .font(.system(size: 12))
                    .foregroundColor(AppColors.textSecondary)
                    .lineLimit(2)
                Text(Formatters.relativeTime(notification.createdAt))
                    .font(.system(size: 10))
                    .foregroundColor(AppColors.textSecondary)
            }
            Spacer()
            Image(systemName: "chevron.left")
                .font(.system(size: 10))
                .foregroundColor(AppColors.textSecondary)
        }
        .padding()
        .background(notification.isRead ? AppColors.surface : AppColors.primary.opacity(0.03))
        .cornerRadius(AppTheme.cardCornerRadius)
    }
}
