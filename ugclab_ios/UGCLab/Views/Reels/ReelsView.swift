import SwiftUI
import AVKit

struct ReelsView: View {
    @State private var reels: [Reel] = []
    @State private var currentIndex = 0
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        GeometryReader { geo in
            if isLoading {
                LoadingView()
            } else if let errorMessage {
                ErrorView(message: errorMessage) { loadReels() }
            } else if reels.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "video.slash")
                        .font(.system(size: 48))
                        .foregroundColor(AppColors.textSecondary)
                    Text("لا توجد ريلز بعد")
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(AppColors.textSecondary)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                TabView(selection: $currentIndex) {
                    ForEach(Array(reels.enumerated()), id: \.element.id) { index, reel in
                        ReelPlayerView(reel: reel, isActive: index == currentIndex)
                            .frame(width: geo.size.width, height: geo.size.height)
                            .tag(index)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .ignoresSafeArea()
            }
        }
        .ignoresSafeArea()
        .onAppear { loadReels() }
    }

    private func loadReels() {
        isLoading = true
        errorMessage = nil
        Task {
            do {
                let result = try await ReelService.shared.getReels()
                await MainActor.run {
                    reels = result
                    isLoading = false
                }
            } catch {
                await MainActor.run {
                    errorMessage = error.localizedDescription
                    isLoading = false
                }
            }
        }
    }
}

struct ReelPlayerView: View {
    let reel: Reel
    let isActive: Bool

    @State private var player: AVPlayer?

    var body: some View {
        ZStack(alignment: .bottom) {
            Color.black.ignoresSafeArea()

            if let player {
                VideoPlayerView(player: player)
                    .ignoresSafeArea()
            }

            VStack(alignment: .trailing, spacing: 16) {
                Spacer()

                HStack {
                    VStack(alignment: .trailing, spacing: 4) {
                        Text(reel.creatorName)
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(.white)
                        if let desc = reel.description {
                            Text(desc)
                                .font(.system(size: 13))
                                .foregroundColor(.white.opacity(0.8))
                                .lineLimit(2)
                        }
                    }
                    Spacer()
                }
                .padding(.horizontal)

                HStack(spacing: 20) {
                    Button(action: {}) {
                        VStack(spacing: 4) {
                            Image(systemName: reel.isLiked ? "heart.fill" : "heart")
                                .font(.system(size: 24))
                            Text("\(reel.likesCount)")
                                .font(.system(size: 11))
                        }
                    }

                    Button(action: {}) {
                        VStack(spacing: 4) {
                            Image(systemName: "paperplane.fill")
                                .font(.system(size: 22))
                            Text("مشاركة")
                                .font(.system(size: 11))
                        }
                    }

                    Button(action: {}) {
                        VStack(spacing: 4) {
                            Image(systemName: reel.isSaved ? "bookmark.fill" : "bookmark")
                                .font(.system(size: 22))
                            Text("حفظ")
                                .font(.system(size: 11))
                        }
                    }
                }
                .foregroundColor(.white)
                .padding(.horizontal)
                .padding(.bottom, 80)
            }
        }
        .onAppear {
            guard let url = URL(string: reel.videoURL) else { return }
            player = AVPlayer(url: url)
            if isActive { player?.play() }
        }
        .onDisappear {
            player?.pause()
            player = nil
        }
        .onChange(of: isActive) { newValue in
            if newValue { player?.play() } else { player?.pause() }
        }
    }
}

struct VideoPlayerView: UIViewControllerRepresentable {
    let player: AVPlayer

    func makeUIViewController(context: Context) -> AVPlayerViewController {
        let controller = AVPlayerViewController()
        controller.player = player
        controller.showsPlaybackControls = false
        controller.videoGravity = .resizeAspectFill
        return controller
    }

    func updateUIViewController(_ uiViewController: AVPlayerViewController, context: Context) {}
}
