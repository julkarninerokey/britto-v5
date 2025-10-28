import { useMemo, useState } from 'react';
import {View, Linking} from 'react-native';
import { Button, Text, VStack } from 'native-base';
import AppBar from '../../components/AppBar';
import {color, toast} from '../../service/utils';
import {WebView} from 'react-native-webview';
import MapLoading from '../../components/MapLoading';

// Replace with your published Google My Maps URL, or pass via route params
const DEFAULT_MY_MAPS_URL =
  'https://www.google.com/maps/d/edit?mid=1qpmkbdLqQB3J92tInbySBauAGtCO2Hg&usp=sharing&z=15';

const CampusMapWeb = ({route}) => {
  const urlFromParams = route?.params?.url;
  const myMapsUrl = useMemo(
    () => urlFromParams || DEFAULT_MY_MAPS_URL,
    [urlFromParams],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const openInBrowser = async () => {
    try {
      const supported = await Linking.canOpenURL(myMapsUrl);
      if (supported) {
        await Linking.openURL(myMapsUrl);
      } else {
        toast(
          'warning',
          'Cannot open link',
          'URL is not supported on this device.',
        );
      }
    } catch (e) {
      toast('danger', 'Failed to open link', e?.message || 'Please try again.');
    }
  };

  const injectedCSS = `
    (function(){
      var css = 'html, body { height: 105% !important; overflow: hidden !important; }' +
                'header, [role="banner"], [aria-label="Sign in"], a[href*="ServiceLogin"], ' +
                'a[aria-label*="Sign in"], .app-ui__header, .app-toolbar, .app-viewcard-strip, ' +
                '.ml-promo, .maps-footer-container { display: none !important; }' +
                '#map, #map-canvas, #content, .app-viewcard-background { height: 105% !important; }';
      var style = document.createElement('style');
      style.type = 'text/css';
      if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); }
      document.head.appendChild(style);
      try {
        var removeByText = function(txt){
          var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null);
          var node;
          while ((node = walker.nextNode())) {
            if (node.innerText && node.innerText.trim().toLowerCase().indexOf(txt) > -1) {
              node.style.display = 'none';
            }
          }
        };
        removeByText('sign in');
        removeByText('create your own map');
      } catch(e){}
    })();
    true;
  `;

  return (
    <View style={{flex: 1, backgroundColor: color.secondaryBackground}}>
      <AppBar title="Campus Map" />

      {/* WebView */}
      <View
        style={{
          flex: 1,
          minHeight: 'auto',
          borderColor: color.border,
          margin: 3,
          backgroundColor: color.background,
        }}>
        {error ? (
          <VStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            space={3}
            px={6}>
            <Text fontSize="lg" color={color.text}>
              ⚠️
            </Text>
            <Text fontSize="md" color={color.text} textAlign="center">
              Failed to load map.
            </Text>
            <Text fontSize="sm" color={color.muted} textAlign="center">
              {String(error)}
            </Text>
            <Button
              onPress={() => {
                setError(null);
                setLoading(true);
              }}
              bg={color.primary}
              _pressed={{bg: color.primaryLight}}>
              Try Again
            </Button>
            <Button
              variant="outline"
              borderColor={color.primary}
              _text={{color: color.primary}}
              onPress={openInBrowser}>
              Open in Browser
            </Button>
          </VStack>
        ) : (
          <View style={{flex: 1}}>
            <WebView
              source={{uri: myMapsUrl}}
              style={{
                flex: 1,
              minWidth: '120%',
              minHeight: '120%',
              alignSelf: 'center',
              margin: '-20%', // pushes edges out of the screen a bit
              borderWidth: 1,
              borderColor: 'red',
              borderStyle: 'solid',
              borderRadius: 10, // optional: looks smoother when zoomed out
            }}
            onLoadEnd={() => setLoading(false)}
            onError={e =>
              setError(e?.nativeEvent?.description || 'Unknown error')
            }
            startInLoadingState
            injectedJavaScriptBeforeContentLoaded={injectedCSS}
            javaScriptEnabled
            domStorageEnabled
            setSupportMultipleWindows={false}
            renderLoading={() => (
              <MapLoading />
            )}
          /> 
          </View>
        )}
      </View>
    </View>
  );
};

export default CampusMapWeb;
