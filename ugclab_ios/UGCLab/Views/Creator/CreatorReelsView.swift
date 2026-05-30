import SwiftUI

struct CreatorReelsView: View {
    @State private var reels: [Reel] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                HStack {
                    NavigationLink(destination: UploadReelView()) {
                        Label("رفع ريل جديد", systemImage: "plus")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 10)
                            .background(AppColors.primary)
                            .cornerRadius(AppTheme.cornerRadius)
                    }
                    Spacer()
                }
                .padding(.horizontal)

                if isLoading {
                    ForEach(0..<4, id: \.self) { _ in SkeletonCard() }
                } else if let errorMessage {
                    ErrorView(message: errorMessage) { loadReels() }
                } else if reels.isEmpty {
                    VStack(spacing: 12) {
                        Image(systemName: "video.slash")
                            .font(.system(size: 36))
                            .foregroundColor(AppColors.textSecondary)
                        Text("لم ترفع أي ريل بعد")
                            .font(.system(size: 15))
                            .foregroundColor(AppColors.textSecondary)
                    }
                    .padding(.top, 60)
                } else {
                    ForEach(reels) { reel in
                        HStack(spacing: 12) {
                            VStack(alignment: .trailing, spacing: 4) {
                                Text(reel.description ?? "ريل")
                                    .font(.system(size: 14, weight: .medium))
                                    .foregroundColor(AppColors.textPrimary)
                                HStack {
                                    Text("\(reel.likesCount) إعجاب")
                                    Text("\(reel.viewsCount) مشاهدة")
                                }
                                .font(.system(size: 11))
                                .foregroundColor(AppColors.textSecondary)
                            }
                            Spacer()
                            AsyncImage(url: URL(string: reel.thumbnailURL ?? "")) { image in
                                image.resizable().scaledToFill()
                            } placeholder: {
                                Rectangle().fill(AppColors.border)
                            }
                            .frame(width: 60, height: 80)
                            .cornerRadius(8)
                        }
                        .padding()
                        .background(AppColors.surface)
                        .cornerRadius(AppTheme.cardCornerRadius)
                        .padding(.horizontal)
                        .swipeActions(edge: .trailing, allowsFullSwipe: true) {
                            Button(role: .destructive) {
                                deleteReel(reel)
                            } label: {
                                Label("حذف", systemImage: "trash")
                            }
                        }
                    }
                }
            }
            .padding(.vertical)
        }
        .background(AppColors.background)
        .navigationTitle("الريلز الخاصة بي")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear { loadReels() }
    }

    private func loadReels() {
        isLoading = true
        Task {
            do {
                let result = try await ReelService.shared.getMyReels()
                await MainActor.run { reels = result; isLoading = false }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isLoading = false }
            }
        }
    }

    private func deleteReel(_ reel: Reel) {
        Task {
            try? await ReelService.shared.deleteReel(id: reel.id)
            await MainActor.run { reels.removeAll { $0.id == reel.id } }
        }
    }
}
