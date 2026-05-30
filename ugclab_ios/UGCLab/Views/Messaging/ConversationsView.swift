import SwiftUI

struct ConversationsView: View {
    @State private var conversations: [Message] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 12) {
                    if isLoading {
                        ForEach(0..<5, id: \.self) { _ in SkeletonCard() }
                    } else if let errorMessage {
                        ErrorView(message: errorMessage) { loadConversations() }
                    } else if conversations.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "message.fill")
                                .font(.system(size: 48))
                                .foregroundColor(AppColors.textSecondary)
                            Text("لا توجد رسائل")
                                .font(.system(size: 15))
                                .foregroundColor(AppColors.textSecondary)
                            Text("ابدأ بالتواصل مع المبدعين والمعلنين")
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        .padding(.top, 80)
                    } else {
                        ForEach(conversations) { msg in
                            NavigationLink(destination: ChatView(conversationWith: msg.senderId, name: msg.senderName, avatar: msg.senderAvatar)) {
                                ConversationRow(message: msg)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding()
            }
            .background(AppColors.background)
            .navigationTitle("الرسائل")
            .navigationBarTitleDisplayMode(.large)
            .onAppear { loadConversations() }
        }
    }

    private func loadConversations() {
        isLoading = true
        Task {
            do {
                let result = try await MessageService.shared.getConversations()
                await MainActor.run { conversations = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}

struct ConversationRow: View {
    let message: Message

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: message.senderAvatar ?? "")) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                Circle().fill(AppColors.border)
            }
            .frame(width: 44, height: 44)
            .clipShape(Circle())

            VStack(alignment: .trailing, spacing: 2) {
                Text(message.senderName)
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(AppColors.textPrimary)
                Text(message.content)
                    .font(.system(size: 12))
                    .foregroundColor(AppColors.textSecondary)
                    .lineLimit(1)
            }
            Spacer()
            Text(Formatters.relativeTime(message.createdAt))
                .font(.system(size: 10))
                .foregroundColor(AppColors.textSecondary)
        }
        .padding()
        .background(message.isRead ? AppColors.surface : AppColors.primary.opacity(0.04))
        .cornerRadius(AppTheme.cardCornerRadius)
    }
}
