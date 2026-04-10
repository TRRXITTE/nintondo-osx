import React from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { Alert, Image, Linking, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { getApplicationName, getBuildNumber, getBundleId, getUniqueIdSync, getVersion, hasGmsSync } from 'react-native-device-info';
import { Icon } from '@rneui/themed';
import Rate, { AndroidMarket } from 'react-native-rate';
import A from '../../blue_modules/analytics';
import { BlueCard, BlueTextCentered } from '../../BlueComponents';
import { HDSegwitBech32Wallet } from '../../class';
import presentAlert from '../../components/Alert';
import Button from '../../components/Button';
import ListItem from '../../components/ListItem';
import { useTheme } from '../../components/themes';
import loc, { formatStringAddTwoWhiteSpaces } from '../../loc';
import { useExtendedNavigation } from '../../hooks/useExtendedNavigation';
import { useSettings } from '../../hooks/context/useSettings';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import { BlueSpacing20 } from '../../components/BlueSpacing';

const branch = require('../../current-branch.json');

const About: React.FC = () => {
  const { navigate } = useExtendedNavigation();
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const { isElectrumDisabled } = useSettings();

  const stylesHook = StyleSheet.create({
    textBackup: {
      color: colors.foregroundColor,
    },
    buildWith: {
      backgroundColor: colors.inputBackgroundColor,
    },
    buttonLink: {
      backgroundColor: colors.lightButton,
    },
    textLink: {
      color: colors.foregroundColor,
    },
  });

  const handleOnReleaseNotesPress = () => {
    navigate('ReleaseNotes');
  };

  const handleOnSelfTestPress = () => {
    if (isElectrumDisabled) {
      presentAlert({ message: loc.settings.about_selftest_electrum_disabled });
    } else {
      navigate('SelfTest');
    }
  };

  const handleOnLicensingPress = () => {
    navigate('Licensing');
  };

  const handleOnTwitterPress = () => {
    Linking.openURL('https://x.com/trrxitte');
  };

  const handleOnTelegramPress = () => {
    Linking.openURL('https://t.me/nintondo');
  };

  const handleOnGithubPress = () => {
    Linking.openURL('https://github.com/TRRXITTE/nintondo-osx');
  };

  const handleOnSupportPress = () => {
    Linking.openURL('mailto:integration@trrxitte.com');
  };

  const handleOnBugReportPress = () => {
    Linking.openURL('mailto:nintondo-osx@trrxitte.com');
  };

  const handleOnRatePress = () => {
    const options = {
      AppleAppID: '1376878040',
      GooglePackageName: 'io.nintondo.osx',
      preferredAndroidMarket: AndroidMarket.Google,
      preferInApp: Platform.OS !== 'android',
      openAppStoreIfInAppFails: true,
      fallbackPlatformURL: 'https://github.com/TRRXITTE/nintondo-osx',
    };
    Rate.rate(options, success => {
      if (success) {
        console.log('User Rated.');
      }
    });
  };

  return (
    <SafeAreaScrollView testID="AboutScrollView" contentInsetAdjustmentBehavior="automatic" automaticallyAdjustContentInsets>
      <BlueCard>
        <View style={styles.center}>
          <Image style={styles.logo} source={require('../../img/icon.png')} resizeMode="contain" />
          <Text style={styles.textFree}>{loc.settings.about_free}</Text>
          <Text style={[styles.textBackup, stylesHook.textBackup]}>{formatStringAddTwoWhiteSpaces(loc.settings.about_backup)}</Text>
          {((Platform.OS === 'android' && hasGmsSync()) || Platform.OS !== 'android') && (
            <Button onPress={handleOnRatePress} title={loc.settings.about_review + ' ⭐🙏'} />
          )}
        </View>
      </BlueCard>
      <ListItem
        leftIcon={{
          name: 'x-twitter',
          type: 'font-awesome-6',
          color: '#000000',
        }}
        onPress={handleOnTwitterPress}
        title={loc.settings.about_sm_twitter}
      />
      <ListItem
        leftIcon={{
          name: 'telegram',
          type: 'font-awesome',
          color: '#000000',
        }}
        onPress={handleOnTelegramPress}
        title={loc.settings.about_sm_telegram}
      />
      {/* Discord intentionally hidden until the public server is ready again. */}
      <BlueCard>
        <View style={[styles.buildWith, stylesHook.buildWith]}>
          <BlueSpacing20 />
          <BlueTextCentered>Built to current Nintondo specifications</BlueTextCentered>
          <BlueSpacing20 />
          <BlueTextCentered>React Native</BlueTextCentered>
          <BlueTextCentered>bitcoinjs-lib</BlueTextCentered>
          <BlueTextCentered>Node.js</BlueTextCentered>
          <BlueTextCentered>ElectrumX</BlueTextCentered>
          <BlueSpacing20 />
          <BlueTextCentered>Source code</BlueTextCentered>
          <BlueTextCentered>github.com/TRRXITTE/nintondo-osx</BlueTextCentered>
          <BlueSpacing20 />
          <Pressable
            accessibilityRole="button"
            onPress={handleOnGithubPress}
            android_ripple={{ color: colors.androidRippleColor }}
            style={({ pressed }) => [Platform.OS === 'ios' && pressed ? styles.pressed : null, styles.buttonLink, stylesHook.buttonLink]}
          >
            <Icon size={22} name="github" type="font-awesome-5" color={colors.foregroundColor} />
            <Text style={[styles.textLink, stylesHook.textLink]}>Open source repository</Text>
          </Pressable>
        </View>
      </BlueCard>
      <ListItem
        leftIcon={{
          name: 'envelope',
          type: 'font-awesome',
          color: '#4CAF50',
        }}
        onPress={handleOnSupportPress}
        title="Support"
        subtitle="integration@trrxitte.com"
      />
      <ListItem
        leftIcon={{
          name: 'bug',
          type: 'font-awesome',
          color: '#FC0D44',
        }}
        onPress={handleOnBugReportPress}
        title="Bug Reports"
        subtitle="nintondo-osx@trrxitte.com"
      />
      <ListItem
        leftIcon={{
          name: 'book',
          type: 'font-awesome',
          color: '#9AA0AA',
        }}
        chevron
        onPress={handleOnReleaseNotesPress}
        title={loc.settings.about_release_notes}
      />
      <ListItem
        leftIcon={{
          name: 'balance-scale',
          type: 'font-awesome',
          color: colors.foregroundColor,
        }}
        chevron
        onPress={handleOnLicensingPress}
        title={loc.settings.about_license}
      />
      <ListItem
        leftIcon={{
          name: 'flask',
          type: 'font-awesome',
          color: '#FC0D44',
        }}
        chevron
        onPress={handleOnSelfTestPress}
        testID="RunSelfTestButton"
        title={loc.settings.about_selftest}
      />
      <ListItem
        leftIcon={{
          name: 'flask',
          type: 'font-awesome',
          color: '#FC0D44',
        }}
        chevron
        onPress={async () => {
          const secret = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
          const w = new HDSegwitBech32Wallet();
          w.setSecret(secret);

          const start = Date.now();
          let num;
          for (num = 0; num < 1000; num++) {
            w._getExternalAddressByIndex(num);
            if (Date.now() - start > 10 * 1000) {
              break;
            }
          }

          Alert.alert(loc.formatString(loc.settings.performance_score, { num }));
        }}
        title={loc.settings.run_performance_test}
      />
      <BlueSpacing20 />
      <BlueSpacing20 />
      <BlueTextCentered>
        {getApplicationName()} ver {getVersion()} (build {getBuildNumber() + ' ' + branch})
      </BlueTextCentered>
      <BlueTextCentered>{new Date(Number(getBuildNumber()) * 1000).toUTCString()}</BlueTextCentered>
      <BlueTextCentered>{getBundleId()}</BlueTextCentered>
      <BlueTextCentered>
        w, h = {width}, {height}
      </BlueTextCentered>
      <BlueTextCentered>Unique ID: {getUniqueIdSync()}</BlueTextCentered>
      <View style={styles.copyToClipboard}>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            const stringToCopy = 'userId:' + getUniqueIdSync();
            A.logError('copied unique id');
            Clipboard.setString(stringToCopy);
          }}
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.copyToClipboardText}>{loc.transactions.details_copy}</Text>
        </Pressable>
      </View>
      <BlueSpacing20 />
      <BlueSpacing20 />
    </SafeAreaScrollView>
  );
};

export default About;

const styles = StyleSheet.create({
  copyToClipboard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyToClipboardText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#68bbe1',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 54,
  },
  logo: {
    width: 112,
    height: 112,
    marginBottom: 24,
  },
  textFree: {
    maxWidth: 280,
    marginBottom: 24,
    color: '#9AA0AA',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  textBackup: {
    maxWidth: 260,
    marginBottom: 40,
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  buildWith: {
    padding: 16,
    paddingTop: 0,
    borderRadius: 8,
  },
  buttonLink: {
    borderRadius: 12,
    justifyContent: 'center',
    padding: 8,
    flexDirection: 'row',
  },
  textLink: {
    marginLeft: 8,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
});
