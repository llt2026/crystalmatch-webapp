/**
 * 水晶数据库 - 包含与五种能量类型相关的水晶信息
 */

const crystalDatabase = {
  growth: [
    { 
      name: '绿幽灵水晶', 
      reason: '增强生长能量，激发创造力', 
      tip: '放在工作区域，每天触摸3-5分钟，有助于激发创新思维',
      image: '/crystals/green-phantom.png'
    },
    { 
      name: '绿色碧玺', 
      reason: '补充生长能量，增强生命力', 
      tip: '佩戴在项链或手链上，靠近心脏位置，增强活力',
      image: '/crystals/green-tourmaline.png'
    },
    {
      name: '翡翠',
      reason: '平衡生长能量，促进和谐发展',
      tip: '随身携带，定期清洗，保持能量纯净',
      image: '/crystals/jade.png'
    }
  ],
  passion: [
    { 
      name: '红纹石', 
      reason: '提升热情能量，增强自信心', 
      tip: '早晨冥想时握住它，设定积极的日常目标',
      image: '/crystals/red-rutile.png'
    },
    { 
      name: '太阳石', 
      reason: '激活热情能量，促进乐观思维', 
      tip: '放在阳光充足的窗台，每天吸收10分钟的阳光',
      image: '/crystals/sunstone.png'
    },
    {
      name: '红玛瑙',
      reason: '稳定热情能量，增强意志力',
      tip: '在重要决策前，轻握在手中3分钟，增强决心',
      image: '/crystals/red-agate.png'
    }
  ],
  stability: [
    { 
      name: '黄水晶', 
      reason: '强化稳固能量，增强安全感', 
      tip: '放在家中或办公室的中央位置，创造稳定的环境',
      image: '/crystals/citrine.png'
    },
    { 
      name: '虎眼石', 
      reason: '平衡稳固能量，增强决策力', 
      tip: '重要决策前，将它放在左手掌心，深呼吸5次',
      image: '/crystals/tigers-eye.png'
    },
    {
      name: '茶晶',
      reason: '接地稳固能量，增强耐心',
      tip: '工作压力大时，轻触它5分钟，帮助恢复平静',
      image: '/crystals/smoky-quartz.png'
    }
  ],
  clarity: [
    { 
      name: '白水晶', 
      reason: '提升清晰能量，增强思维能力', 
      tip: '在思考或冥想时，将它放在额头前方，帮助理清思路',
      image: '/crystals/clear-quartz.png'
    },
    { 
      name: '月光石', 
      reason: '增强清晰能量，提高直觉', 
      tip: '入睡前放在枕边，有助于解决梦中的问题',
      image: '/crystals/moonstone.png'
    },
    {
      name: '紫水晶',
      reason: '开启清晰能量，增强洞察力',
      tip: '需要灵感时，凝视它1-2分钟，帮助开启思路',
      image: '/crystals/amethyst.png'
    }
  ],
  fluid: [
    { 
      name: '海蓝宝', 
      reason: '增强流动能量，促进情绪顺畅', 
      tip: '洗澡时，将它放在浴室，帮助释放压力和情绪',
      image: '/crystals/aquamarine.png'
    },
    { 
      name: '蓝碧玺', 
      reason: '活化流动能量，增强沟通能力', 
      tip: '在沟通困难时，将它轻握在手中，帮助表达流畅',
      image: '/crystals/blue-tourmaline.png'
    },
    {
      name: '青金石',
      reason: '平衡流动能量，增强真实表达',
      tip: '演讲或重要会议前触摸它，增强表达自信',
      image: '/crystals/lapis-lazuli.png'
    }
  ]
};

export default crystalDatabase; 