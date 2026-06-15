<template>
  <div class="ai-chat">
    <Header />
    
    <div class="container">
      <div class="chat-header">
        <h2>🤖 AI 文化助手</h2>
        <p>关于畲族文化，您想了解什么？</p>
      </div>
      
      <div class="chat-container">
        <div class="chat-messages" ref="chatContainer">
          <div 
            v-for="(msg, index) in messages" 
            :key="index"
            class="message"
            :class="msg.role"
          >
            <div class="avatar">
              <span v-if="msg.role === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="content">
              <div class="text">{{ msg.content }}</div>
              <div class="time">{{ msg.time }}</div>
            </div>
          </div>
          
          <div v-if="isLoading" class="message assistant">
            <div class="avatar">🤖</div>
            <div class="content">
              <div class="text typing">
                <span class="dot">●</span>
                <span class="dot">●</span>
                <span class="dot">●</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="userInput"
            placeholder="请输入您的问题..."
            @keyup.enter="sendMessage"
            :disabled="isLoading"
          >
            <template #append>
              <el-button @click="sendMessage" :loading="isLoading">发送</el-button>
            </template>
          </el-input>
          
          <div class="quick-questions">
            <span class="label">常见问题：</span>
            <el-tag 
              v-for="q in quickQuestions" 
              :key="q"
              class="question-tag"
              @click="sendQuickQuestion(q)"
            >
              {{ q }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
    
    <Footer />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import axios from 'axios'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const chatContainer = ref(null)

const quickQuestions = [
  '畲族是什么时候形成的？',
  '畲族有哪些传统节日？',
  '畲族服饰有什么特点？',
  '畲族有什么特色美食？',
  '畲族传统工艺有哪些？',
  '畲族盘瓠传说是什么？',
  '畲族山歌有什么特点？',
  '畲族婚俗有哪些？',
  '畲族分布在哪些地区？',
  '畲族有哪些非遗项目？'
]

const qaDatabase = {
  '畲族是什么时候形成的': '畲族的形成可追溯到隋唐时期。据史料记载，畲族源于古代长沙的"武陵蛮"，与苗族、瑶族有着密切的渊源关系。主要分布在福建、浙江、江西、广东、安徽等省份。',
  '畲族有哪些传统节日': '畲族的主要传统节日包括：\n1. 春节：是畲族最隆重的节日，有祭祖、拜年等活动\n2. 清明节：祭祖扫墓，缅怀先人\n3. 端午节：包粽子、赛龙舟\n4. 七月节：祭祀祖先\n5. 重阳节：登高祭祖\n6. 分龙节：畲族特有的祈雨节日',
  '畲族服饰有什么特点': '畲族服饰具有鲜明的民族特色：\n1. 色彩：以蓝青色为主，喜庆时用红色\n2. 款式：男女均穿右衽短衫\n3. 头饰：女性戴凤冠，饰有银饰\n4. 绑腿：男女都绑腿，便于山间劳作\n5. 图案：服饰上绣有各种吉祥图案，如凤凰、牡丹等',
  '畲族有什么特色美食': '畲族特色美食包括：\n1. 乌米饭：畲族传统小吃，用乌稔树叶染色的糯米饭\n2. 糍粑：糯米制成的传统食品\n3. 竹筒饭：将米饭放在竹筒中烤制\n4. 畲乡菜：特色蔬菜烹饪\n5. 酿酒：畲族米酒、黄酒',
  '畲族传统工艺有哪些': '畲族传统工艺包括：\n1. 彩带编织：畲族最具代表性的手工艺品\n2. 竹编：各种竹器用品\n3. 刺绣：服饰和装饰品的绣制\n4. 银饰制作：耳环、项链、手镯等\n5. 陶瓷：畲族蓝釉陶瓷工艺品',
  '畲族': '畲族是中国南方的一个少数民族，主要分布在福建、浙江、江西、广东、安徽等地。畲族有着悠久的历史和丰富的文化传统，包括独特的服饰、节日、工艺和饮食习惯。',
  '畲族文化': '畲族文化是中华民族文化的重要组成部分，包括：\n1. 民间文学：神话传说、民间故事\n2. 音乐舞蹈：山歌、祭祀舞蹈\n3. 工艺美术：彩带、竹编、刺绣\n4. 民俗风情：婚嫁、祭祀、节日\n5. 饮食文化：乌米饭、糍粑等',
  '畲族传统': '畲族传统包括：\n1. 祭祖传统：重视祖先崇拜\n2. 山歌传统：能歌善舞，以歌会友\n3. 盘瓠传说：畲族始祖传说\n4. 婚俗传统：独特的嫁娶仪式\n5. 服饰传统：精美的民族服饰',
  '畲族历史': '畲族历史悠久，源于古代"武陵蛮"。隋唐时期已居住在闽、粤、赣三省交界地区。宋元时期逐步迁居到闽东、浙南等地。清代以后，畲族逐渐形成今天的分布格局。',
  
  // 新增内容
  '畲族盘瓠传说': '盘瓠传说畲族的始祖传说。相传古代高辛帝时期，番王作乱，高辛帝张榜求贤，声称谁能斩下番王首级，就将公主许配给他。一只名叫盘瓠的 神犬揭榜，咬死番王归来。高辛帝将公主嫁给盘瓠，后来生儿育女，繁衍成为畲族。盘瓠被畲族人民尊为始祖。',
  '畲族山歌': '畲族山歌是畲族文化的重要载体，具有以下特点：\n1. 内容丰富：包括劳动歌、情歌、叙事歌等\n2. 形式多样：有独唱、对唱、合唱等形式\n3. 即兴创作：歌手根据现场情况即兴填词\n4. 传承方式：多为口头传唱，代代相传\n5. 演唱场合：劳动生产、婚嫁喜庆、节日聚会等',
  '畲族婚俗': '畲族婚俗具有独特的民族特色：\n1. 提亲：男方向女方提亲，需请媒人前往\n2. 定亲：交换信物，确定婚期\n3. 迎亲：新郎亲自迎娶，有拦门、对歌等习俗\n4. 拜堂：拜祖先、拜高堂、夫妻对拜\n5. 回门：婚后第三天新娘回娘家',
  '畲族丧葬': '畲族丧葬习俗包括：\n1. 报丧：亲人去世后要向亲友报丧\n2. 吊丧：亲友前来吊唁，送丧礼\n3. 出殡：选择吉日出殡，有丧葬仪式\n4. 祭祀：葬后要定期祭祀\n5. 拾骨：多年后拾骨重葬',
  '畲族建筑': '畲族传统建筑特点：\n1. 房屋类型：多为土木结构的瓦房\n2. 布局：以"三合院"、"四合院"为主\n3. 特色：正厅设有祖先牌位\n4. 吊脚楼：山区常见干栏式建筑\n5. 装饰：门楼、窗棂有精美雕刻',
  '畲族宗教信仰': '畲族宗教信仰主要是祖先崇拜和自然崇拜：\n1. 祖先崇拜：敬奉盘瓠为始祖\n2. 自然崇拜：敬奉山神、土地神等\n3. 道教影响：部分仪式由道士主持\n4. 祭祀活动：春节、清明、重阳等节日祭祀\n5. 禁忌：忌吃狗肉、忌坐门槛等',
  '畲族语言': '畲族有本民族的语言——畲语，属汉藏语系。特点：\n1. 接近客家话：与客家方言有相似之处\n2. 无文字：历史上没有本民族文字\n3. 使用汉字：用汉字记录畲语\n4. 山哈话：自称"山哈话"为日常用语\n5. 文化传承：通过山歌传唱保留语言',
  '畲族分布': '畲族主要分布在以下地区：\n1. 福建省：约占全国畲族人口的40%\n2. 浙江省：约占30%，主要在浙南山区\n3. 江西省：约占15%，主要在赣东地区\n4. 广东省：约占10%，主要在粤东山区\n5. 安徽省：少量分布',
  '畲族人口': '根据最新统计，畲族人口约70万人，是中国人口较多的少数民族之一。主要聚居在闽、浙、赣三省交界的山区，形成了"大分散、小聚居"的分布格局。',
  '畲族经济': '畲族地区经济以农业为主：\n1. 农业：种植水稻、茶叶、药材等\n2. 林业：竹林、木材采伐\n3. 畜牧业：养殖猪、牛、鸡等\n4. 手工业：竹编、彩带制作等\n5. 旅游业：民族文化体验游兴起',
  '畲族教育': '畲族教育发展历程：\n1. 传统教育：私塾、祠堂教育\n2. 近代：创办民族小学\n3. 新中国：建立民族中学\n4. 高等教育：设立民族预科班\n5. 现在：普及九年义务教育',
  '畲族音乐': '畲族音乐主要包括：\n1. 山歌：劳动时演唱的民歌\n2. 祭祀歌：祭祀仪式演唱\n3. 叙事歌：讲述传说故事\n4. 情歌：青年男女表达爱意\n5. 节日歌：喜庆场合演唱',
  '畲族舞蹈': '畲族舞蹈具有浓郁民族特色：\n1. 祭祀舞：祭祀祖先神灵时表演\n2. 竹竿舞：传统体育舞蹈\n3. 狩猎舞：模拟狩猎场景\n4. 婚嫁舞：婚庆场合表演\n5. 盘瓠舞：表现始祖传说',
  '畲族美术': '畲族美术包括：\n1. 刺绣：服饰图案精美\n2. 彩带：编织各种花纹\n3. 竹编：生活器具编织\n4. 剪纸：节日装饰\n5. 银饰：打造精美饰品',
  '畲族医药': '畲族医药是中华民族医药宝库的重要组成部分：\n1. 草药：使用山中野生药材\n2. 疗法：拔罐、刮痧、针灸等\n3. 传承：口传心授为主\n4. 特点：就地取材，简便易行\n5. 发展：逐渐与现代医学结合',
  '畲族节庆活动': '畲族重要节庆活动：\n1. 春节：祭祖、拜年、唱山歌\n2. 清明节：扫墓、祭祖\n3. 端午节：包粽子、赛龙舟\n4. 七月节：祭祀祖先\n5. 重阳节：登高、祭祖\n6. 分龙节：祈雨仪式',
  '畲族非遗': '畲族非物质文化遗产丰富：\n1. 畲族民歌：国家级非遗\n2. 畲族婚俗：省级非遗\n3. 畲族彩带编织技艺：省级非遗\n4. 畲族医药：省级非遗\n5. 畲族刺绣：市级非遗',
  '畲族旅游': '畲族主要旅游景区：\n1. 浙江景宁畲族自治县：中国唯一的畲族自治县\n2. 福建宁德：畲族人口最多的地区\n3. 江西赣州：畲族聚居地\n4. 广东潮州：畲族文化保护区\n5. 浙江温州：畲族文化生态园',
  '畲族保护政策': '国家对畲族的保护政策：\n1. 民族区域自治：设立畲族自治县\n2. 经济发展扶持：少数民族地区优惠政策\n3. 文化保护：非遗传承人保护制度\n4. 教育扶持：民族教育专项计划\n5. 医疗卫生：农村合作医疗覆盖',
  
  'default': '您好！我是浙江畲族文化交流平台的AI助手，关于畲族文化，您可以问我：\n\n1. 畲族的历史渊源\n2. 畲族的传统节日\n3. 畲族服饰特点\n4. 畲族特色美食\n5. 畲族传统工艺\n6. 畲族山歌文化\n7. 畲族婚俗习惯\n8. 畲族分布情况\n9. 畲族非遗项目\n10. 畲族旅游景点\n\n请输入您感兴趣的话题，我会为您详细解答。'
}

const getAnswer = (question) => {
  const lowerQuestion = question.toLowerCase()
  
  const keywordMap = {
    '天气': '您好！我是畲族文化AI助手，专注于解答关于畲族文化的问题。关于天气问题，我可以告诉您：畲族主要分布在福建、浙江、江西、广东、安徽等地的山区，这些地区气候温和湿润，四季分明。如果您想了解畲族地区的气候特点，欢迎咨询！',
    '时间': '您好！我是畲族文化AI助手。关于时间，现在时间是：' + new Date().toLocaleString('zh-CN') + '。如果您想了解畲族传统节日的时间安排，欢迎咨询！',
    '今天': '您好！我是畲族文化AI助手。关于今天，我想分享一些畲族文化：畲族是中国重要的少数民族，有着丰富的文化传统。您想了解畲族的哪些方面呢？',
    '现在': '您好！我是畲族文化AI助手。关于现在，我想分享一些畲族文化：畲族文化正在被更好地保护和传承。您想了解畲族的哪些方面呢？',
    '吃饭': '畲族有很多特色美食！包括：\n1. 乌米饭 - 用乌稔树叶染色的糯米饭，是畲族传统小吃\n2. 糍粑 - 糯米制成的传统食品\n3. 竹筒饭 - 将米饭放在竹筒中烤制\n4. 畲乡菜 - 特色蔬菜烹饪\n5. 酿酒 - 畲族米酒、黄酒',
    '你好': '您好！我是浙江畲族文化交流平台的AI助手，很高兴为您服务！关于畲族的历史、文化、传统习俗、节日、服饰、美食、工艺等方面的问题，我都可以为您解答。您想了解什么呢？',
    'hi': '您好！Hello! I\'m the She cultural assistant. What would you like to know about She culture?',
    'hello': '您好！Hello! I\'m the She cultural assistant. What would you like to know about She culture?',
    '谢谢': '不客气！很高兴能帮到您！如果您对畲族文化有任何问题，欢迎随时问我！',
    '再见': '再见！希望您能继续关注和支持畲族文化的传承与发展！',
    '你是谁': '您好！我是浙江畲族文化交流平台的AI助手，专门为您解答关于畲族文化的问题。畲族是中国南方的重要少数民族，有着悠久的历史和丰富的文化传统。我可以为您介绍畲族的历史、节日、服饰、美食、工艺等方面的知识。'
  }
  
  for (const key in keywordMap) {
    if (lowerQuestion.includes(key)) {
      return keywordMap[key]
    }
  }
  
  for (const key in qaDatabase) {
    if (lowerQuestion.includes(key)) {
      return qaDatabase[key]
    }
  }
  
  return '您好！关于您的问题，我建议咨询畲族文化相关的内容。作为畲族文化AI助手，我可以为您介绍：\n\n1. 畲族的历史渊源\n2. 畲族的传统节日\n3. 畲族服饰特点\n4. 畲族特色美食\n5. 畲族传统工艺\n6. 畲族山歌文化\n7. 畲族婚俗习惯\n8. 畲族分布情况\n9. 畲族非遗项目\n10. 畲族旅游景点\n\n请输入您感兴趣的话题，我会为您详细解答。'
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return
  
  const question = userInput.value.trim()
  const now = new Date()
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  messages.value.push({
    role: 'user',
    content: question,
    time: timeStr
  })
  
  userInput.value = ''
  isLoading.value = true
  
  await scrollToBottom()
  
  try {
    const history = messages.value
      .filter(m => m.role !== 'assistant' || m.content !== qaDatabase['default'])
      .slice(-20)
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    
    const res = await axios.post('/api/ai/chat', {
      message: question,
      history
    })
    
    const answer = res.data?.data?.message || getAnswer(question)
    const answerTime = new Date()
    const answerTimeStr = `${answerTime.getHours().toString().padStart(2, '0')}:${answerTime.getMinutes().toString().padStart(2, '0')}`
    
    messages.value.push({
      role: 'assistant',
      content: answer,
      time: answerTimeStr
    })
  } catch (error) {
    console.error('AI响应错误:', error)
    const answer = getAnswer(question)
    const answerTime = new Date()
    const answerTimeStr = `${answerTime.getHours().toString().padStart(2, '0')}:${answerTime.getMinutes().toString().padStart(2, '0')}`
    
    messages.value.push({
      role: 'assistant',
      content: answer,
      time: answerTimeStr
    })
  }
  
  isLoading.value = false
  scrollToBottom()
}

const sendQuickQuestion = (question) => {
  userInput.value = question
  sendMessage()
}

onMounted(() => {
  const now = new Date()
  messages.value.push({
    role: 'assistant',
    content: qaDatabase['default'],
    time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  })
})
</script>

<style scoped lang="scss">
.ai-chat {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 60px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
}

.chat-header {
  text-align: center;
  color: white;
  margin-bottom: 20px;
  
  h2 {
    font-size: 32px;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 16px;
    opacity: 0.9;
  }
}

.chat-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.chat-messages {
  height: 500px;
  overflow-y: auto;
  padding: 20px;
  background: #f8f9fa;
  
  .message {
    display: flex;
    margin-bottom: 20px;
    
    &.user {
      flex-direction: row-reverse;
      
      .content {
        align-items: flex-end;
        
        .text {
          background: #1E3A8A;
          color: white;
        }
      }
    }
    
    &.assistant {
      .text {
        background: white;
        color: #333;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }
    }
    
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e0e7ff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      margin: 0 12px;
    }
    
    .content {
      display: flex;
      flex-direction: column;
      max-width: 70%;
      
      .text {
        padding: 12px 16px;
        border-radius: 12px;
        line-height: 1.6;
        white-space: pre-wrap;
      }
      
      .time {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
        padding: 0 4px;
      }
    }
    
    .typing {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      
      .dot {
        animation: bounce 1.4s infinite ease-in-out both;
        color: #1E3A8A;
        
        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
      }
    }
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chat-input {
  padding: 20px;
  background: white;
  border-top: 1px solid #eee;
  
  .el-input {
    margin-bottom: 15px;
  }
  
  .quick-questions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    
    .label {
      font-size: 14px;
      color: #666;
    }
    
    .question-tag {
      cursor: pointer;
      transition: all 0.3s;
      
      &:hover {
        transform: scale(1.05);
        background: #1E3A8A;
        color: white;
      }
    }
  }
}
</style>
