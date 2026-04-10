//  BlueWalletWatch Extension
//
//  Created by Marcos Rodriguez on 3/11/19.

import WatchKit
import Foundation
import CoreImage

class ViewQRCodefaceController: WKInterfaceController {
  
  static let identifier = "ViewQRCodefaceController"
  @IBOutlet weak var imageInterface: WKInterfaceImage!
  @IBOutlet weak var addressLabel: WKInterfaceLabel!
  
  var address: String? {
    didSet {
      updateQRCode()
      updateUserActivity()
    }
  }

  private var interfaceMode = ReceiveInterfaceMode.Address
  private let userActivity: NSUserActivity = NSUserActivity(activityType: HandoffIdentifier.Xpub.rawValue)
    
  override func awake(withContext context: Any?) {
    super.awake(withContext: context)
    configureUserActivity()
    guard let passedContext = context as? String  else {
      pop()
      return
    }
    address = passedContext
    addressLabel.setText(passedContext)
    toggleViewButtonPressed()
  }

  private func configureUserActivity() {
    userActivity.title = HandOffTitle.Xpub.rawValue
    userActivity.requiredUserInfoKeys = [HandOffUserInfoKey.Xpub.rawValue]
    userActivity.isEligibleForHandoff = true
  }
  
  private func updateUserActivity() {
    if let address = address, !address.isEmpty {
      userActivity.userInfo = [HandOffUserInfoKey.Xpub.rawValue: address]
      userActivity.becomeCurrent()
    } else {
      userActivity.invalidate()
    }
  }

  private func updateQRCode() {
    guard let address = address, !address.isEmpty else {
      imageInterface.setImage(nil)
      return
    }
    DispatchQueue.global(qos: .userInteractive).async {
      guard let image = self.makeQRCodeImage(from: address) else {
        return
      }
      DispatchQueue.main.async {
        self.imageInterface.setImage(image)
      }
    }
  }

  private func makeQRCodeImage(from content: String) -> UIImage? {
    guard let data = content.data(using: .utf8),
          let filter = CIFilter(name: "CIQRCodeGenerator") else {
      return nil
    }

    filter.setValue(data, forKey: "inputMessage")
    filter.setValue("M", forKey: "inputCorrectionLevel")

    guard let outputImage = filter.outputImage else {
      return nil
    }

    let scaledImage = outputImage.transformed(by: CGAffineTransform(scaleX: 6, y: 6))
    let context = CIContext()

    guard let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) else {
      return nil
    }

    return UIImage(cgImage: cgImage)
  }

  @IBAction @objc func toggleViewButtonPressed() {
    clearAllMenuItems()
    interfaceMode = interfaceMode == .QRCode ? .Address : .QRCode

    let menuItemTitle = interfaceMode == .QRCode ? "QR Code" : "Address"
    let systemImageName = interfaceMode == .QRCode ? "textformat.subscript" : "qrcode"
    let defaultMenuItemIcon = interfaceMode == .QRCode ? WKMenuItemIcon.shuffle : WKMenuItemIcon.shuffle

    addressLabel.setHidden(interfaceMode != .Address)
    imageInterface.setHidden(interfaceMode != .QRCode)

    if #available(watchOSApplicationExtension 6.0, *), let image = UIImage(systemName: systemImageName) {
      addMenuItem(with: image, title: menuItemTitle, action: #selector(toggleViewButtonPressed))
    } else {
      addMenuItem(with: defaultMenuItemIcon, title: menuItemTitle, action: #selector(toggleViewButtonPressed))
    }
  }
  
  override func willActivate() {
    super.willActivate()
    updateUserActivity()
  }

  override func didDeactivate() {
    super.didDeactivate()
    userActivity.invalidate()
  }
}
