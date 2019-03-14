import View from 'girder/views/View';
import panelTemplate from '../../../templates/visualization/panels/panel.pug';
import DatesView from './datesView';
import { restRequest } from 'girder/rest';

var TitlesView = View.extend({
  events:{
    'click .g-nav-link-history-title': 'findDate'
  },
  initialize(settings){
    this.titles = settings.titles || '';
    this.userId = settings.userId;
    this.dockerImage = settings.dockerImage;
    this.$el.html(panelTemplate({
      panel:'title',
      titles: this.titles
    }))
  },
  findDate(e){
    restRequest({
        url: 'SSR',
        data:{userId:this.userId, dockerImage:this.dockerImage, title:$(e.currentTarget).attr('title'), limit:0}
    }).done(_.bind(function(res) {
      console.log(res)
      // let dockerImages = [];
      // var uniqueDockerImages = [];
      // for(let a = 0; a < tasks.length; a++){
      //   dockerImages.push(tasks[a].task.dockerImage);
      // }
      // $.each(dockerImages, function(i, el){
      //     if($.inArray(el, uniqueDockerImages) === -1) uniqueDockerImages.push(el);
      // });
      // console.log('click');
      if(this.datesView){
        this.datesView.destroy()
      }
      this.datesView = new DatesView({
        userId: this.userId,
        dockerImages: this.dockerImage,
        title: this.titles,
        dateAndJobs: res,
        parentView: this
      })
      $('.history-date').html(this.datesView.el);
    },this))
  },
});

export default TitlesView;