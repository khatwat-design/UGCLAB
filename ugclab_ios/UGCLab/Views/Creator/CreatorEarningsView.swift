import SwiftUI

struct CreatorEarningsView: View {
    @State private var transactions: [Transaction] = []
    @State private var totalEarnings: Double = 0
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                if isLoading {
                    ForEach(0..<3, id: \.self) { _ in SkeletonCard() }
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadEarnings() }
                } else {
                    VStack(spacing: 8) {
                        Text(Formatters.currency(totalEarnings))
                            .font(.system(size: 32, weight: .bold))
                            .foregroundColor(AppColors.primary)
                        Text("إجمالي الأرباح")
                            .font(.system(size: 13))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .padding(.vertical, 24)

                    if transactions.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "dollarsign.circle")
                                .font(.system(size: 36))
                                .foregroundColor(AppColors.textSecondary)
                            Text("لا توجد معاملات بعد")
                                .font(.system(size: 15))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        .padding(.top, 20)
                    } else {
                        ForEach(transactions) { tx in
                            HStack {
                                Text(Formatters.currency(tx.amount))
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(tx.amount > 0 ? .green : AppColors.error)
                                Spacer()
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text(tx.description ?? "")
                                        .font(.system(size: 13))
                                        .foregroundColor(AppColors.textPrimary)
                                    Text(Formatters.relativeTime(tx.createdAt))
                                        .font(.system(size: 11))
                                        .foregroundColor(AppColors.textSecondary)
                                }
                            }
                            .padding()
                            .background(AppColors.surface)
                            .cornerRadius(AppTheme.cornerRadius)
                        }
                    }
                }
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("الأرباح")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadEarnings() }
    }

    private func loadEarnings() {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let response = try await APIClient.shared.get(APIEndpoint.creatorEarnings)
                let txs: [Transaction] = {
                    guard let data = try? JSONSerialization.data(withJSONObject: response["data"] ?? response["transactions"] ?? []),
                          let items = try? JSONDecoder().decode([Transaction].self, from: data) else { return [] }
                    return items
                }()
                let total = response["total_earnings"] as? Double ?? response["total"] as? Double ?? 0
                await MainActor.run { transactions = txs; totalEarnings = total; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}
