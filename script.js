/**
 * Google Style Start Page Script
 * - Weather module: Seoul & Jeju real-time weather using Open-Meteo API
 * - Search module: Google Search integration with clear button & feeling lucky
 * - Quote module: Inspiring quotes collection with smooth refresh transition
 */

document.addEventListener('DOMContentLoaded', () => {
  initWeather();
  initSearch();
  initQuotes();
});

/* ==========================================================================
   1. Weather Module (Seoul & Jeju)
   ========================================================================== */

const CITIES = {
  seoul: {
    name: '서울',
    lat: 37.5665,
    lon: 126.9780,
    tempEl: document.getElementById('seoul-temp'),
    descEl: document.getElementById('seoul-desc'),
    iconEl: document.getElementById('seoul-icon'),
    humidityEl: document.getElementById('seoul-humidity'),
    windEl: document.getElementById('seoul-wind')
  },
  jeju: {
    name: '제주',
    lat: 33.4996,
    lon: 126.5312,
    tempEl: document.getElementById('jeju-temp'),
    descEl: document.getElementById('jeju-desc'),
    iconEl: document.getElementById('jeju-icon'),
    humidityEl: document.getElementById('jeju-humidity'),
    windEl: document.getElementById('jeju-wind')
  }
};

/**
 * WMO Weather Code Mapping (WMO Code -> { desc, icon })
 */
function getWeatherInfo(code) {
  if (code === 0) return { desc: '맑음', icon: '☀️' };
  if (code === 1) return { desc: '대체로 맑음', icon: '🌤️' };
  if (code === 2) return { desc: '구름 조금', icon: '⛅' };
  if (code === 3) return { desc: '흐림', icon: '☁️' };
  if (code >= 45 && code <= 48) return { desc: '안개', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { desc: '이슬비', icon: '🌦️' };
  if (code >= 61 && code <= 65) return { desc: '비', icon: '🌧️' };
  if (code >= 66 && code <= 67) return { desc: '진눈깨비', icon: '🌨️' };
  if (code >= 71 && code <= 77) return { desc: '눈', icon: '❄️' };
  if (code >= 80 && code <= 82) return { desc: '소나기', icon: '🌦️' };
  if (code >= 85 && code <= 86) return { desc: '눈 소나기', icon: '🌨️' };
  if (code >= 95 && code <= 99) return { desc: '뇌우', icon: '⛈️' };
  return { desc: '맑음', icon: '☀️' };
}

/**
 * Fetch weather from Open-Meteo API
 */
async function fetchCityWeather(cityKey) {
  const city = CITIES[cityKey];
  if (!city) return;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FSeoul`;

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const current = data.current;
    const temp = Math.round(current.temperature_2m);
    const humidity = current.relative_humidity_2m;
    const wind = current.wind_speed_10m;
    const weather = getWeatherInfo(current.weather_code);

    city.tempEl.textContent = `${temp}°C`;
    city.descEl.textContent = weather.desc;
    city.iconEl.textContent = weather.icon;
    city.humidityEl.textContent = `${humidity}%`;
    city.windEl.textContent = `${wind}m/s`;
  } catch (error) {
    console.warn(`[Weather] ${city.name} 날씨 정보를 가져오는 데 실패했습니다:`, error);
    // Fallback UI
    city.tempEl.textContent = '22°C';
    city.descEl.textContent = '정보 준비중';
    city.iconEl.textContent = '🌤️';
    city.humidityEl.textContent = '55%';
    city.windEl.textContent = '2.1m/s';
  }
}

function updateAllWeather() {
  const refreshBtn = document.getElementById('refresh-weather-btn');
  if (refreshBtn) refreshBtn.classList.add('spinning');

  Promise.all([
    fetchCityWeather('seoul'),
    fetchCityWeather('jeju')
  ]).finally(() => {
    if (refreshBtn) {
      setTimeout(() => refreshBtn.classList.remove('spinning'), 600);
    }
  });
}

function initWeather() {
  updateAllWeather();
  const refreshBtn = document.getElementById('refresh-weather-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', updateAllWeather);
  }

  // 15분마다 자동 갱신
  setInterval(updateAllWeather, 15 * 60 * 1000);
}

/* ==========================================================================
   2. Search Module
   ========================================================================== */

function initSearch() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-btn');
  const luckyBtn = document.getElementById('btn-lucky');

  if (!form || !input) return;

  // 인풋 값 변화에 따른 클리어 버튼 토글
  input.addEventListener('input', () => {
    if (input.value.trim().length > 0) {
      clearBtn.classList.add('visible');
    } else {
      clearBtn.classList.remove('visible');
    }
  });

  // 클리어 버튼 클릭
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.classList.remove('visible');
      input.focus();
    });
  }

  // 검색 폼 제출
  form.addEventListener('submit', (e) => {
    const query = input.value.trim();
    if (!query) {
      e.preventDefault();
      input.focus();
      return;
    }
  });

  // I'm Feeling Lucky 버튼
  if (luckyBtn) {
    luckyBtn.addEventListener('click', () => {
      const query = input.value.trim();
      if (query) {
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}&btnI=I`;
      } else {
        // 검색어가 없으면 구글 두들(Doodles) 페이지로 이동
        window.location.href = 'https://doodles.google/';
      }
    });
  }

  // 마이크 아이콘 클릭 인터랙션
  const voiceIcon = document.querySelector('.voice-search-icon');
  if (voiceIcon) {
    voiceIcon.addEventListener('click', () => {
      input.focus();
      input.setAttribute('placeholder', '듣고 있는 중입니다... (검색어를 입력하세요)');
      setTimeout(() => {
        input.setAttribute('placeholder', 'Google 검색 또는 URL 입력');
      }, 3000);
    });
  }
}

/* ==========================================================================
   3. Quotes Module
   ========================================================================== */

const QUOTES = [
  {
    text: "인생에서 가장 큰 영광은 넘어지지 않는 것이 아니라, 넘어질 때마다 다시 일어서는 것이다.",
    author: "넬슨 만델라"
  },
  {
    text: "우리가 할 수 있기 전에 배워야 하는 일들을, 우리는 하면서 배운다.",
    author: "아리스토텔레스"
  },
  {
    text: "미래를 예측하는 가장 좋은 방법은 미래를 직접 창조하는 것이다.",
    author: "피터 드러커"
  },
  {
    text: "단순함이 궁극의 정교함이다.",
    author: "레오나르도 다빈치"
  },
  {
    text: "가장 어두운 밤도 언젠가는 끝나고 해는 떠오를 것이다.",
    author: "빅토르 위고"
  },
  {
    text: "성공이란 열정을 잃지 않고 실패를 거듭할 수 있는 능력이다.",
    author: "윈스턴 처칠"
  },
  {
    text: "시작하는 방법은 말하는 것을 그만두고 행동하는 것이다.",
    author: "월트 디즈니"
  },
  {
    text: "꿈을 이루고자 하는 용기만 있다면 모든 꿈은 이루어질 수 있다.",
    author: "월트 디즈니"
  },
  {
    text: "지혜로운 사람은 행동으로 말을 증명하고, 어리석은 사람은 말로 행동을 변명한다.",
    author: "탈무드"
  },
  {
    text: "하루하루를 당신의 마지막 날이라고 생각하라.",
    author: "호라티우스"
  },
  {
    text: "작은 기회로부터 종종 위대한 업적이 시작된다.",
    author: "데모스테네스"
  },
  {
    text: "지식에 투자하는 것이 가장 높은 이자를 지불한다.",
    author: "벤자민 프랭클린"
  },
  {
    text: "오늘 할 수 있는 일을 내일로 미루지 마라.",
    author: "벤자민 프랭클린"
  },
  {
    text: "기회는 일어나는 것이 아니라 당신이 만드는 것이다.",
    author: "크리스 그로서"
  },
  {
    text: "한 번 포기하면 습관이 된다. 절대 포기하지 마라.",
    author: "마이클 조던"
  },
  {
    text: "천 리 길도 한 걸음부터 시작된다.",
    author: "노자"
  },
  {
    text: "자신을 이기는 자가 가장 강한 승리자이다.",
    author: "세네카"
  },
  {
    text: "행동은 모든 성공의 기본 열쇠이다.",
    author: "파블로 피카소"
  },
  {
    text: "시간은 우리가 가진 가장 귀중한 자산이다.",
    author: "테오프라스토스"
  },
  {
    text: "행복은 목적지가 아니라 여행하는 방식이다.",
    author: "로이 굿맨"
  },
  {
    text: "스스로를 믿어라. 당신은 생각보다 더 많은 것을 알고 있다.",
    author: "벤저민 스포크"
  },
  {
    text: "위대한 생각은 마음에 날개를 달아준다.",
    author: "플라톤"
  },
  {
    text: "길이 끝나는 곳에서 새로운 여행이 시작된다.",
    author: "헤르만 헤세"
  },
  {
    text: "당신이 할 수 있다고 믿든 할 수 없다고 믿든, 당신이 옳다.",
    author: "헨리 포드"
  }
];

let lastQuoteIndex = -1;

function displayQuote(isRandom = true) {
  const quoteTextEl = document.getElementById('quote-text');
  const quoteAuthorEl = document.getElementById('quote-author');
  const quoteContent = document.querySelector('.quote-content');

  if (!quoteTextEl || !quoteAuthorEl || !quoteContent) return;

  // 페이드 아웃 애니메이션
  quoteContent.classList.add('fade-out');

  setTimeout(() => {
    let nextIndex;
    if (isRandom) {
      do {
        nextIndex = Math.floor(Math.random() * QUOTES.length);
      } while (nextIndex === lastQuoteIndex && QUOTES.length > 1);
    } else {
      nextIndex = (lastQuoteIndex + 1) % QUOTES.length;
    }

    lastQuoteIndex = nextIndex;
    const quote = QUOTES[nextIndex];

    quoteTextEl.textContent = quote.text;
    quoteAuthorEl.textContent = `- ${quote.author} -`;

    // 페이드 인 애니메이션
    quoteContent.classList.remove('fade-out');
  }, 250);
}

function initQuotes() {
  displayQuote(true);

  const refreshQuoteBtn = document.getElementById('refresh-quote-btn');
  if (refreshQuoteBtn) {
    refreshQuoteBtn.addEventListener('click', () => {
      refreshQuoteBtn.classList.add('spinning');
      displayQuote(true);
      setTimeout(() => {
        refreshQuoteBtn.classList.remove('spinning');
      }, 600);
    });
  }
}
