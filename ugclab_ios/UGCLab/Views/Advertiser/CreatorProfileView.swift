import SwiftUI

struct CreatorProfileView: View {
    let creator: User
    @State private var reels: [Reel] = []
    @State private var isLoading = true

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                VStack(spacing: 12) {
                    AsyncImage(url: URL(string: creator.avatarURL ?? "")) { image in
                        image.resizable().scaledToFill()
                    } placeholder: {
                        Circle().fill(AppColors.border)
                    }
                    .frame(width: 80, height: 80)
                    .clipShape(Circle())

                    HStack {
                        if creator.isVerified {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 14))
                                .foregroundColor(.green)
                        }
                        Text(creator.name)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)
                    }

                    if let bio = creator.bio {
                        Text(bio)
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.textSecondary)
                            .multilineTextAlignment(.center)
                    }

                    Button(action: invite) {
                        Text("دعوة للتعاون")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 10)
                            .background(AppColors.primary)
                            .cornerRadius(AppTheme.cornerRadius)
                    }
                }
                .padding(.top)

                if !reels.isEmpty {
                    VStack(alignment: .trailing, spacing: 12) {
                        Text("الريلز")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(AppColors.textPrimary)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(reels) { reel in
                                    AsyncImage(url: URL(string: reel.thumbnailURL ?? "")) { image in
                                        image.resizable().scaledToFill()
                                    } placeholder: {
                                        Rectangle().fill(AppColors.border)
                                    }
                                    .frame(width: 120, height: 180)
                                    .cornerRadius(8)
                                }
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
        }
        .background(AppColors.background)
        .navigationTitle("الملف الشخصي")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadData() }
    }

    private func loadData() {
        Task {
            let reels = try? await ReelService.shared.getReels()
            await MainActor.run {
                self.reels = reels?.filter { $0.creatorId == creator.id } ?? []
                isLoading = false
            }
        }
    }

    private func invite() {
        Task {
            try? await CampaignService.shared.inviteCreator(creatorId: creator.id)
        }
    }
}
