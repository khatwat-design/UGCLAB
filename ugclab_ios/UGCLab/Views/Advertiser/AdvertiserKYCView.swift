import SwiftUI

struct AdvertiserKYCView: View {
    @State private var documents: [KycDocument] = []
    @State private var status: String = "not_submitted"
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if isLoading {
                    ForEach(0..<3, id: \.self) { _ in SkeletonCard() }
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadKYC() }
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: kycIcon)
                            .font(.system(size: 48))
                            .foregroundColor(kycColor)
                        Text(kycTitle)
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                        Text(kycDescription)
                            .font(.system(size: 13))
                            .foregroundColor(AppColors.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.vertical, 24)

                    if !documents.isEmpty {
                        ForEach(documents) { doc in
                            HStack {
                                StatusBadge(status: doc.status)
                                Spacer()
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text(doc.type)
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(AppColors.textPrimary)
                                    Text(Formatters.relativeTime(doc.createdAt))
                                        .font(.system(size: 11))
                                        .foregroundColor(AppColors.textSecondary)
                                }
                            }
                            .padding()
                            .background(AppColors.surface)
                            .cornerRadius(AppTheme.cornerRadius)
                        }
                    }

                    if status == "not_submitted" || status == "rejected" {
                        Button(action: {}) {
                            Text("رفع مستند")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: AppTheme.buttonHeight)
                                .background(AppColors.primary)
                                .cornerRadius(AppTheme.cornerRadius)
                        }
                    }
                }
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("التحقق من الهوية")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadKYC() }
    }

    private var kycIcon: String {
        switch status {
        case "approved": return "checkmark.seal.fill"
        case "pending": return "clock.badge.checkmark"
        case "rejected": return "xmark.seal.fill"
        default: return "person.badge.shield.checkmark"
        }
    }

    private var kycColor: Color {
        switch status {
        case "approved": return .green
        case "pending": return .orange
        case "rejected": return .red
        default: return AppColors.textSecondary
        }
    }

    private var kycTitle: String {
        switch status {
        case "approved": return "تم التحقق"
        case "pending": return "قيد المراجعة"
        case "rejected": return "مرفوض"
        default: return "لم يتم التحقق"
        }
    }

    private var kycDescription: String {
        switch status {
        case "approved": return "تم التحقق من هويتك بنجاح"
        case "pending": return "المستندات قيد المراجعة من قبل الفريق"
        case "rejected": return "لم يتم قبول المستندات، يرجى إعادة المحاولة"
        default: return "يرجى رفع مستندات التحقق من الهوية"
        }
    }

    private func loadKYC() {
        isLoading = true
        Task {
            do {
                let response = try await APIClient.shared.get(APIEndpoint.kycMyDocuments)
                let docs: [KycDocument] = {
                    guard let data = try? JSONSerialization.data(withJSONObject: response["data"] ?? response["documents"] ?? []),
                          let items = try? JSONDecoder().decode([KycDocument].self, from: data) else { return [] }
                    return items
                }()
                let s = response["status"] as? String ?? "not_submitted"
                await MainActor.run { documents = docs; status = s; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}
