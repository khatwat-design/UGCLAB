import SwiftUI
import AVKit

struct UploadReelView: View {
    @State private var videoURL: URL?
    @State private var description = ""
    @State private var isUploading = false
    @State private var errorMessage: String?
    @State private var showPicker = false

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                if let videoURL {
                    VideoPlayer(player: AVPlayer(url: videoURL))
                        .frame(height: 400)
                        .cornerRadius(AppTheme.cardCornerRadius)

                    Button(action: { self.videoURL = nil }) {
                        Text("تغيير الفيديو")
                            .font(.system(size: 14))
                            .foregroundColor(AppColors.primary)
                    }
                } else {
                    Button(action: { showPicker = true }) {
                        VStack(spacing: 12) {
                            Image(systemName: "video.badge.plus")
                                .font(.system(size: 48))
                                .foregroundColor(AppColors.primary)
                            Text("اختر فيديو")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(AppColors.primary)
                            Text("MP4, max 100MB")
                                .font(.system(size: 12))
                                .foregroundColor(AppColors.textSecondary)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 250)
                        .background(AppColors.primary.opacity(0.06))
                        .cornerRadius(AppTheme.cardCornerRadius)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppTheme.cardCornerRadius)
                                .stroke(AppColors.primary.opacity(0.3), style: StrokeStyle(lineWidth: 2, dash: [8]))
                        )
                    }
                }

                VStack(alignment: .trailing, spacing: 8) {
                    Text("الوصف")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(AppColors.textSecondary)
                    TextEditor(text: $description)
                        .font(.system(size: 14))
                        .frame(height: 100)
                        .padding(8)
                        .background(AppColors.background)
                        .cornerRadius(AppTheme.cornerRadius)
                        .overlay(
                            RoundedRectangle(cornerRadius: AppTheme.cornerRadius)
                                .stroke(AppColors.border, lineWidth: 1)
                        )
                }

                if let errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 13))
                        .foregroundColor(AppColors.error)
                }

                Button(action: upload) {
                    if isUploading {
                        ProgressView().tint(.white)
                    } else {
                        Text("رفع الريل")
                            .font(.system(size: 16, weight: .bold))
                    }
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: AppTheme.buttonHeight)
                .background(videoURL != nil ? AppColors.primary : AppColors.border)
                .cornerRadius(AppTheme.cornerRadius)
                .disabled(videoURL == nil || isUploading)
            }
            .padding()
        }
        .background(AppColors.background)
        .navigationTitle("رفع ريل جديد")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showPicker) {
            VideoPickerView(selectedURL: $videoURL)
        }
    }

    private func upload() {
        guard let videoURL else { return }
        isUploading = true
        errorMessage = nil
        Task {
            do {
                let data = try Data(contentsOf: videoURL)
                let maxSize = Constants.maxReelFileSize
                guard data.count <= maxSize else {
                    await MainActor.run { errorMessage = "حجم الملف يتجاوز 100MB"; isUploading = false }
                    return
                }
                _ = try await ReelService.shared.uploadReel(videoData: data, description: description.isEmpty ? nil : description)
                await MainActor.run {
                    isUploading = false
                    self.videoURL = nil
                    description = ""
                }
            } catch {
                await MainActor.run { errorMessage = error.localizedDescription; isUploading = false }
            }
        }
    }
}

struct VideoPickerView: UIViewControllerRepresentable {
    @Binding var selectedURL: URL?

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.mediaTypes = ["public.movie"]
        picker.videoQuality = .typeHigh
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: VideoPickerView
        init(_ parent: VideoPickerView) { self.parent = parent }
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            parent.selectedURL = info[.mediaURL] as? URL
            picker.dismiss(animated: true)
        }
    }
}
