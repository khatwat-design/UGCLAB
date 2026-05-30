import SwiftUI

struct AdvertiserCreatorsView: View {
    @State private var creators: [User] = []
    @State private var searchText = ""
    @State private var isLoading = true
    @State private var errorMessage: String?

    var filtered: [User] {
        guard !searchText.isEmpty else { return creators }
        return creators.filter { $0.name.contains(searchText) }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(AppColors.textSecondary)
                    TextField("ابحث عن مبدع...", text: $searchText)
                        .font(.system(size: 14))
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 10)
                .background(AppColors.surface)
                .cornerRadius(AppTheme.cornerRadius)
                .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadius).stroke(AppColors.border, lineWidth: 1))
                .padding(.horizontal)

                if isLoading {
                    ForEach(0..<5, id: \.self) { _ in SkeletonCard() }
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadCreators() }
                } else if filtered.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "person.slash")
                            .font(.system(size: 36))
                            .foregroundColor(AppColors.textSecondary)
                        Text("لا يوجد مبدعون")
                            .font(.system(size: 15))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .padding(.top, 60)
                } else {
                    ForEach(filtered) { creator in
                        NavigationLink(destination: CreatorProfileView(creator: creator)) {
                            CreatorRow(creator: creator)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.vertical)
        }
        .background(AppColors.background)
        .navigationTitle("المبدعين")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadCreators() }
    }

    private func loadCreators() {
        isLoading = true
        Task {
            do {
                let result = try await CampaignService.shared.getCreators()
                await MainActor.run { creators = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }
}

struct CreatorRow: View {
    let creator: User

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: creator.avatarURL ?? "")) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                Circle().fill(AppColors.border)
            }
            .frame(width: 44, height: 44)
            .clipShape(Circle())

            VStack(alignment: .trailing, spacing: 2) {
                HStack {
                    if creator.isVerified {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 10))
                            .foregroundColor(.green)
                    }
                    Text(creator.name)
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(AppColors.textPrimary)
                }
                if let bio = creator.bio {
                    Text(bio)
                        .font(.system(size: 12))
                        .foregroundColor(AppColors.textSecondary)
                        .lineLimit(1)
                }
            }
            Spacer()
            Image(systemName: "chevron.left")
                .font(.system(size: 12))
                .foregroundColor(AppColors.textSecondary)
        }
        .padding()
        .background(AppColors.surface)
        .cornerRadius(AppTheme.cardCornerRadius)
        .padding(.horizontal)
    }
}
