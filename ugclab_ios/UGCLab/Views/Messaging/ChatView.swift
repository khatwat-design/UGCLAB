import SwiftUI

struct ChatView: View {
    let conversationWith: String
    let name: String
    let avatar: String?

    @State private var messages: [Message] = []
    @State private var newMessage = ""
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 8) {
                    if isLoading {
                        ForEach(0..<5, id: \.self) { _ in SkeletonCard() }
                    } else if let errorMessage {
                        ErrorView(message: errorMessage) { loadMessages() }
                    } else if messages.isEmpty {
                        VStack(spacing: 8) {
                            Image(systemName: "bubble.left.and.bubble.right")
                                .font(.system(size: 36))
                                .foregroundColor(AppColors.textSecondary)
                            Text("لا توجد رسائل بعد، ابدأ المحادثة")
                                .font(.system(size: 13))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        .padding(.top, 60)
                    } else {
                        ForEach(messages) { msg in
                            MessageBubble(message: msg)
                        }
                    }
                }
                .padding()
            }
            .background(AppColors.background)

            HStack(spacing: 8) {
                TextField("اكتب رسالة...", text: $newMessage)
                    .font(.system(size: 14))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(AppColors.surface)
                    .cornerRadius(20)
                    .overlay(RoundedRectangle(cornerRadius: 20).stroke(AppColors.border, lineWidth: 1))

                Button(action: sendMessage) {
                    Image(systemName: "paperplane.fill")
                        .font(.system(size: 18))
                        .foregroundColor(.white)
                        .frame(width: 40, height: 40)
                        .background(AppColors.primary)
                        .clipShape(Circle())
                }
                .disabled(newMessage.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding()
            .background(AppColors.surface)
        }
        .navigationTitle(name)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadMessages() }
    }

    private func loadMessages() {
        isLoading = true
        Task {
            do {
                let result = try await MessageService.shared.getConversation(with: conversationWith)
                await MainActor.run { messages = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }

    private func sendMessage() {
        let content = newMessage.trimmingCharacters(in: .whitespaces)
        guard !content.isEmpty else { return }
        newMessage = ""
        Task {
            do {
                let msg = try await MessageService.shared.sendMessage(to: conversationWith, content: content)
                await MainActor.run { messages.append(msg) }
            } catch {}
        }
    }
}

struct MessageBubble: View {
    let message: Message

    var body: some View {
        HStack {
            if message.isMine {
                Spacer(minLength: 60)
            }
            VStack(alignment: message.isMine ? .trailing : .trailing, spacing: 2) {
                Text(message.content)
                    .font(.system(size: 14))
                    .foregroundColor(message.isMine ? .white : AppColors.textPrimary)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 8)
                    .background(message.isMine ? AppColors.primary : AppColors.surface)
                    .cornerRadius(12)
                Text(Formatters.relativeTime(message.createdAt))
                    .font(.system(size: 9))
                    .foregroundColor(AppColors.textSecondary)
            }
            if !message.isMine {
                Spacer(minLength: 60)
            }
        }
    }
}
