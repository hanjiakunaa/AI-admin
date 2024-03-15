import { setting } from '@/config/setting';
const { langKey, themeKey, gptWXKey, gptWxImgKey } = setting;
import Cookies from 'js-cookie';

export function getLanguage() {
  return Cookies.get(langKey);
}

export function setLanguage(lang) {
  return Cookies.set(langKey, lang);
}

export function getSettings() {
  const settings = Cookies.get(themeKey);
  return settings ? JSON.parse(settings) : null;
}

export function setSettings(theme) {
  return Cookies.set(themeKey, JSON.stringify(theme));
}




export function getWXGPTAToken(type) {
  if (type === 'img') {
    const wxToken = Cookies.get(gptWxImgKey);
    return wxToken ? JSON.parse(wxToken) : null;
  } else {
    const wxToken = Cookies.get(gptWXKey);
    return wxToken ? JSON.parse(wxToken) : null;
  }

}
export function setWXGPTAToken(token, type) {

  if (type === 'img') {
    return Cookies.set(gptWxImgKey, JSON.stringify(token), { expires: 3 });

  } else {
    return Cookies.set(gptWXKey, JSON.stringify(token), { expires: 3 });

  }
}