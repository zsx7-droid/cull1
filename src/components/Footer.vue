<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h3>关于我们</h3>
          <p>浙江畲族文化交流与交易平台致力于传承和弘扬畲族文化，为畲族传承人、手工艺人和爱好者提供一站式服务。</p>
        </div>
        
        <div class="footer-section">
          <h3>快速链接</h3>
          <ul>
            <li><router-link to="/culture">文化展示</router-link></li>
            <li><router-link to="/forum">交流论坛</router-link></li>
            <li><router-link to="/activity">文化活动</router-link></li>
            <li><router-link to="/shop">文创商城</router-link></li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3>联系我们</h3>
          <ul>
            <li><el-icon><Phone /></el-icon> 17816163515</li>
            <li><el-icon><Message /></el-icon> 3283185426@qq.com</li>
            <li><el-icon><Location /></el-icon> 浙江省杭州市</li>
          </ul>
        </div>
        
        <div class="footer-section">
          <h3>关注我们</h3>
          <div class="social-links">
            <el-icon class="social-icon"><ChatDotRound /></el-icon>
            <el-icon class="social-icon"><VideoCamera /></el-icon>
            <el-icon class="social-icon"><Share /></el-icon>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2026 浙江畲族文化交流与交易平台 </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped lang="scss">
.footer {
  background: linear-gradient(135deg, #1E3A8A 0%, #0F1F4D 100%);
  color: white;
  padding: 40px 0 20px;
  margin-top: 60px;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-bottom: 30px;
    
    .footer-section {
      h3 {
        font-size: 18px;
        margin-bottom: 15px;
        color: #F59E0B;
      }
      
      ul {
        list-style: none;
        
        li {
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
          
          a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            transition: color 0.3s;
            
            &:hover {
              color: #F59E0B;
            }
          }
        }
      }
      
      p {
        line-height: 1.6;
        color: rgba(255, 255, 255, 0.8);
      }
      
      .social-links {
        display: flex;
        gap: 15px;
        
        .social-icon {
          font-size: 28px;
          cursor: pointer;
          transition: color 0.3s;
          
          &:hover {
            color: #F59E0B;
          }
        }
      }
    }
  }
  
  .footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    
    p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 14px;
    }
  }
}
</style>
