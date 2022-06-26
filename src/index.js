import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  I18nManager,
  ViewPropTypes,
} from 'react-native';
import * as Animatable from 'react-native-animatable';

const styles = StyleSheet.create({
  containerDefault: {},
  cellDefault: {
    borderColor: 'gray',
    borderWidth: 1,
  },
  cellFocusedDefault: {
    borderColor: 'black',
    borderWidth: 2,
  },
  textStyleDefault: {
    color: 'gray',
    fontSize: 24,
  },
  textStyleFocusedDefault: {
    color: 'black',
  },
});

const SmoothPinCodeInput = ({
  value,
  codeLength,
  cellSize,
  cellSpacing,
  onTextChange,
  placeholder,
  password,
  mask,
  autoFocus,
  containerStyle,
  cellStyle,
  cellStyleFocused,
  cellStyleFilled,
  textStyle,
  textStyleFocused,
  keyboardType,
  animationFocused,
  animated,
  testID,
  editable,
  inputProps,
  disableFullscreenUI,
  onFulfill,
  onBackspace,
  ...props
}) => {
  const ref = useRef();
  const inputRef = useRef();
  const [maskDelay, setMaskDelay] = useState(false);
  const [focused, setFocused] = useState(false);
  let maskTimeout = null;

  const animate = ({
    animation = 'shake',
    duration = 650
  }) => {
    if (!props.animated) {
      return new Promise((resolve, reject) => reject(new Error('Animations are disabled')));
    }
    return ref.current[animation](duration);
  };

  const shake = () => animate({ animation: 'shake' });

  const focus = () => inputRef.current.focus();

  const blur = () => inputRef.current.blur();

  const clear = () => inputRef.current.clear();

  const _inputCode = (code) => {

    if (props.restrictToNumbers) {
      code = (code.match(/[0-9]/g) || []).join('');
    }

    if (onTextChange) {
      onTextChange(code);
    }
    if (code.length === codeLength && onFulfill) {
      onFulfill(code);
    }

    // handle password mask
    const maskDelay = password &&
      code.length > props.value.length; // only when input new char
    setMaskDelay(maskDelay);

    if (maskDelay) { // mask password after delay
      clearTimeout(maskTimeout);
      maskTimeout = setTimeout(() => {
          setMaskDelay(false);
        },
        props.maskDelay
      );
    }
  };

  const _keyPress = (event) => {
    if (event.nativeEvent.key === 'Backspace') {
      if (value === '' && onBackspace) {
        onBackspace();
      }
    }
  };

  const _onFocused = () => {
    setFocused(true);
    if (typeof props.onFocus === 'function') {
      props.onFocus();
    }
  };

  const _onBlurred = () => {
    setFocused(false);
    if (typeof props.onBlur === 'function') {
      props.onBlur();
    }
  };

  useEffect(() => {
    return clearTimeout(maskTimeout);
  }, []);
  return (
    <Animatable.View
      ref={ref}
      style={[{
        alignItems: 'stretch',
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'relative',
        width: cellSize * codeLength + cellSpacing * (codeLength - 1),
        height: cellSize,
      },
        containerStyle,
      ]}>
      <View style={{
        position: 'absolute',
        margin: 0,
        height: '100%',
        flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
      }}>
        {
          Array.apply(null, Array(codeLength))
            .map((_, idx) => {
              const cellFocused = focused && idx === value.length;
              const filled = idx < value.length;
              const last = (idx === value.length - 1);
              const showMask = filled && (password && (!maskDelay || !last));
              const isPlaceholderText = typeof placeholder === 'string';
              const isMaskText = typeof mask === 'string';
              const pinCodeChar = value.charAt(idx);

              let cellText = null;
              if (filled || placeholder !== null) {
                if (showMask && isMaskText) {
                  cellText = mask;
                } else if (!filled && isPlaceholderText) {
                  cellText = placeholder;
                } else if (pinCodeChar) {
                  cellText = pinCodeChar;
                }
              }

              const placeholderComponent = !isPlaceholderText ? placeholder : null;
              const maskComponent = (showMask && !isMaskText) ? mask : null;
              const isCellText = typeof cellText === 'string';

              return (
                <React.Fragment>
                  <Animatable.View
                    key={idx}
                    style={[
                      {
                        width: cellSize,
                        height: cellSize,
                        marginLeft: cellSpacing / 2,
                        marginRight: cellSpacing / 2,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                      cellStyle,
                      cellFocused ? cellStyleFocused : {},
                      filled ? cellStyleFilled : {},
                    ]}
                    animation={idx === value.length && focused && animated ? animationFocused : null}
                    iterationCount="infinite"
                    duration={500}
                  >
                    {isCellText && !maskComponent &&
                    <Text style={[textStyle, cellFocused ? textStyleFocused : {}]}>
                      {cellText}
                    </Text>}

                    {(!isCellText && !maskComponent) && placeholderComponent}
                    {isCellText && maskComponent}
                  </Animatable.View>
                </React.Fragment>
              );
            })
        }
      </View>
      <TextInput
        disableFullscreenUI={disableFullscreenUI}
        value={value}
        ref={inputRef}
        onChangeText={_inputCode}
        onKeyPress={_keyPress}
        onFocus={() => _onFocused()}
        onBlur={() => _onBlurred()}
        spellCheck={false}
        autoFocus={autoFocus}
        keyboardType={keyboardType}
        numberOfLines={1}
        caretHidden
        maxLength={codeLength}
        selection={{
          start: value.length,
          end: value.length,
        }}
        style={{
          flex: 1,
          opacity: 0,
          textAlign: 'center',
        }}
        testID={testID || undefined}
        editable={editable}
        {...inputProps} />
    </Animatable.View>
  );
};

SmoothPinCodeInput.defaultProps = {
  value: '',
  codeLength: 4,
  cellSize: 48,
  cellSpacing: 4,
  placeholder: '',
  password: false,
  mask: '*',
  maskDelay: 200,
  keyboardType: 'numeric',
  autoFocus: false,
  restrictToNumbers: false,
  containerStyle: styles.containerDefault,
  cellStyle: styles.cellDefault,
  cellStyleFocused: styles.cellFocusedDefault,
  textStyle: styles.textStyleDefault,
  textStyleFocused: styles.textStyleFocusedDefault,
  animationFocused: 'pulse',
  animated: true,
  editable: true,
  inputProps: {},
  disableFullscreenUI: true
};

SmoothPinCodeInput.propTypes = {
  value: PropTypes.string,
  codeLength: PropTypes.number,
  cellSize: PropTypes.number,
  cellSpacing: PropTypes.number,
  placeholder: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  mask: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  maskDelay: PropTypes.number,
  password: PropTypes.bool,
  autoFocus: PropTypes.bool,
  restrictToNumbers: PropTypes.bool,
  containerStyle: ViewPropTypes.style,
  cellStyle: ViewPropTypes.style,
  cellStyleFocused: ViewPropTypes.style,
  cellStyleFilled: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  textStyleFocused: Text.propTypes.style,
  animated: PropTypes.bool,
  animationFocused: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]),
  onFulfill: PropTypes.func,
  onChangeText: PropTypes.func,
  onBackspace: PropTypes.func,
  onTextChange: PropTypes.func,
  testID: PropTypes.any,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  keyboardType: PropTypes.string,
  editable: PropTypes.bool,
  inputProps: PropTypes.exact(TextInput.propTypes)
};

export default SmoothPinCodeInput;
