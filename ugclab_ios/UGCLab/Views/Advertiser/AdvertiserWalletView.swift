import SwiftUI

struct AdvertiserWalletView: View {
    @State private var wallet: Wallet?
    @State private var transactions: [Transaction] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if isLoading {
                    ForEach(0..<3, id: \.self) { _ in SkeletonCard() }
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadWallet() }
                } else {
                    VStack(spacing: 8) {
                        Text(Formatters.currency(wallet?.balance ?? 0))
                            .font(.system(size: 36, weight: .bold))
                            .foregroundColor(AppColors.primary)
                        Text("الرصيد الحالي")
                            .font(.system(size: 13))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .padding(.vertical, 24)

                    HStack(spacing: 12) {
                        Button(action: {}) {
                            Label("إيداع", systemImage: "arrow.down.circle.fill")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 44)
                                .background(.green)
                                .cornerRadius(AppTheme.cornerRadius)
                        }
                        Button(action: {}) {
                            Label("سحب", systemImage: "arrow.up.circle.fill")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .frame(height: 44)
                                .background(AppColors.primary)
                                .cornerRadius(AppTheme.cornerRadius)
                        }
                    }
                    .padding(.horizontal)

                    if transactions.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "list.clipboard")
                                .font(.system(size: 36))
                                .foregroundColor(AppColors.textSecondary)
                            Text("لا توجد معاملات")
                                .font(.system(size: 15))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        .padding(.top, 20)
                    } else {
                        ForEach(transactions) { tx in
                            HStack {
                                Text(Formatters.currency(tx.amount))
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundColor(tx.type == "deposit" ? .green : AppColors.error)
                                Spacer()
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text(tx.description ?? tx.type)
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
        .navigationTitle("المحفظة")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadWallet() }
    }

    private func loadWallet() {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let walletResp = try await APIClient.shared.get(APIEndpoint.wallet)
                let txResp = try await APIClient.shared.get(APIEndpoint.transactions)
                let w: Wallet? = {
                    guard let data = try? JSONSerialization.data(withJSONObject: walletResp["wallet"] ?? walletResp),
                          let w = try? JSONDecoder().decode(Wallet.self, from: data) else { return nil }
                    return w
                }()
                let txs: [Transaction] = {
                    guard let data = try? JSONSerialization.data(withJSONObject: txResp["data"] ?? txResp["transactions"] ?? []),
                          let items = try? JSONDecoder().decode([Transaction].self, from: data) else { return [] }
                    return items
                }()
                await MainActor.run { wallet = w; transactions = txs; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}
